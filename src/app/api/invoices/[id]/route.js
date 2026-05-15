import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'
import { updateInvoiceSchema } from '@/lib/validation/invoice'
import {
  buildSellerFromCompany,
  computeTotalsFromLineInput,
  serializeInvoiceDocument,
} from '@/lib/services/invoiceDocument'

async function authenticate(request, log) {
  const cookieClient = await createClient()
  const {
    data: { user },
    error: authError,
  } = await cookieClient.auth.getUser()

  if (authError || !user) throw AppError.unauthorized()

  const userLog = log.child({ userId: user.id })

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.company_id) {
    throw AppError.forbidden('Complete onboarding first')
  }

  return { userId: user.id, companyId: profile.company_id, userLog }
}

function canTransition(from, to) {
  /** @type {Record<string, string[]>} */
  const map = {
    draft: ['draft', 'pending', 'rejected'],
    pending: ['pending', 'approved', 'rejected', 'paid'],
    approved: ['approved', 'paid', 'rejected'],
    rejected: ['rejected'],
    paid: ['paid'],
  }
  return Boolean(map[from]?.includes(to))
}

/**
 * GET /api/invoices/[id]
 */
export async function GET(request, { params }) {
  const start = Date.now()
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const route = `GET /api/invoices/${params.id}`
  const log = createRequestLogger({ requestId, route })

  try {
    const { companyId, userLog } = await authenticate(request, log)
    const invoiceId = params.id

    const [{ data: row, error: invErr }, { data: items, error: itemErr }] = await Promise.all([
      supabaseAdmin.from('invoices').select('*').eq('id', invoiceId).eq('company_id', companyId).single(),
      supabaseAdmin
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('sort_order', { ascending: true }),
    ])

    if (invErr || !row || itemErr) {
      if (invErr?.code === 'PGRST116' || !row) throw AppError.notFound('Invoice not found')
      userLog.warn({ invErr, itemErr }, 'invoice fetch failed')
      throw AppError.internal('Failed to load invoice')
    }

    const doc = serializeInvoiceDocument(row, items ?? [])
    userLog.info({ invoiceId, durationMs: Date.now() - start }, 'Invoice detail')

    return NextResponse.json(doc)
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    log.error({ err, durationMs: Date.now() - start }, 'GET invoice detail failed')
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Something went wrong' } },
      { status: 500 },
    )
  }
}

/**
 * PATCH /api/invoices/[id]
 */
export async function PATCH(request, { params }) {
  const start = Date.now()
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const route = `PATCH /api/invoices/${params.id}`
  const log = createRequestLogger({ requestId, route })

  try {
    const { companyId, userLog } = await authenticate(request, log)
    const invoiceId = params.id

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') throw AppError.badRequest('Request body must be valid JSON')

    const parsed = updateInvoiceSchema.safeParse(body)
    if (!parsed.success) {
      throw AppError.badRequest('Validation failed', {
        issues: parsed.error.flatten().fieldErrors,
      })
    }

    const patch = parsed.data
    const hasStructureUpdate =
      patch.items !== undefined ||
      patch.buyer !== undefined ||
      patch.paymentTerms !== undefined ||
      patch.acceptedMethods !== undefined ||
      patch.discount !== undefined ||
      patch.withholdingTaxRate !== undefined ||
      patch.dueDate !== undefined ||
      patch.invoiceDate !== undefined ||
      patch.currency !== undefined ||
      patch.purchaseOrderNumber !== undefined ||
      patch.requiresSignature !== undefined ||
      patch.signedBy !== undefined

    const { data: existing, error: loadErr } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('company_id', companyId)
      .single()

    if (loadErr?.code === 'PGRST116' || !existing) throw AppError.notFound('Invoice not found')

    if (
      patch.status !== undefined &&
      !canTransition(String(existing.status), patch.status)
    ) {
      throw AppError.badRequest(`Invalid status transition: ${existing.status} → ${patch.status}`)
    }

    if (patch.status !== undefined && !hasStructureUpdate) {
      if (patch.status !== existing.status) {
        const { error: stOnlyErr } = await supabaseAdmin
          .from('invoices')
          .update({ status: patch.status })
          .eq('id', invoiceId)
          .eq('company_id', companyId)

        if (stOnlyErr) {
          userLog.error({ err: stOnlyErr }, 'status-only update failed')
          throw AppError.internal('Failed to update invoice')
        }
      }

      userLog.info(
        { invoiceId, status: patch.status, durationMs: Date.now() - start },
        'invoice status patched',
      )
      return NextResponse.json({ ok: true, status: patch.status })
    }

    if (existing.status !== 'draft' && hasStructureUpdate) {
      throw AppError.badRequest('Only draft invoices can be edited')
    }

    if (patch.items !== undefined && existing.status !== 'draft') {
      throw AppError.badRequest('Cannot replace line items for non-draft invoice')
    }

    if (existing.status !== 'draft') {
      throw AppError.badRequest('Nothing to update')
    }

    const { data: companyRow, error: companyErr } = await supabaseAdmin
      .from('companies')
      .select('name, cac_number, tin, vat_number, address, contact, bank_details')
      .eq('id', companyId)
      .single()

    if (companyErr || !companyRow) {
      throw AppError.internal('Failed to fetch company data')
    }

    const seller = buildSellerFromCompany(companyRow)
    const nextBuyer = patch.buyer ?? existing.buyer
    const discount = patch.discount ?? Number(existing.discount)
    const whtRate = patch.withholdingTaxRate ?? Number(existing.withholding_tax_rate ?? 0)
    const nextItemsPayload = patch.items

    if (!nextItemsPayload) {
      const reqSig =
        patch.requiresSignature !== undefined ? patch.requiresSignature : existing.requires_signature
      const signedByVal = patch.signedBy !== undefined ? patch.signedBy : existing.signed_by
      const invDate = patch.invoiceDate !== undefined ? patch.invoiceDate : existing.invoice_date

      /** @type {Record<string, unknown>} */
      const metaUpdate = { seller }
      if (patch.dueDate !== undefined) metaUpdate.due_date = patch.dueDate
      if (patch.invoiceDate !== undefined) metaUpdate.invoice_date = patch.invoiceDate
      if (patch.currency !== undefined) metaUpdate.currency = patch.currency
      if (patch.purchaseOrderNumber !== undefined)
        metaUpdate.purchase_order_number = patch.purchaseOrderNumber
      if (patch.buyer !== undefined) metaUpdate.buyer = patch.buyer
      if (patch.paymentTerms !== undefined) metaUpdate.payment_terms = patch.paymentTerms
      if (patch.acceptedMethods !== undefined) metaUpdate.accepted_methods = patch.acceptedMethods
      if (patch.requiresSignature !== undefined) metaUpdate.requires_signature = patch.requiresSignature
      if (patch.signedBy !== undefined) metaUpdate.signed_by = patch.signedBy
      metaUpdate.signature_date =
        Boolean(reqSig) && Boolean(signedByVal) ? invDate : null

      if (patch.status !== undefined) metaUpdate.status = patch.status

      const { error: metaErr } = await supabaseAdmin
        .from('invoices')
        .update(metaUpdate)
        .eq('id', invoiceId)

      if (metaErr) {
        userLog.error({ err: metaErr }, 'meta update failed')
        throw AppError.internal('Failed to update invoice')
      }
      userLog.info({ invoiceId, durationMs: Date.now() - start }, 'draft invoice metadata updated')
      return NextResponse.json({ ok: true })
    }

    /** Full line recompute draft update */
    const totals = computeTotalsFromLineInput(nextItemsPayload, discount, whtRate)

    /** @type {Record<string, unknown>} */
    const invoiceUpdate = {
      seller,
      buyer: nextBuyer,
      subtotal: totals.subtotal,
      discount: totals.discount,
      vat_amount: totals.vatAmount,
      withholding_tax_rate: totals.withholdingTaxRate,
      withholding_tax_amount: totals.withholdingTaxAmount,
      grand_total: totals.grandTotal,
      net_payable: totals.netPayable,
    }

    invoiceUpdate.invoice_date =
      patch.invoiceDate !== undefined ? patch.invoiceDate : existing.invoice_date
    invoiceUpdate.due_date = patch.dueDate !== undefined ? patch.dueDate : existing.due_date
    invoiceUpdate.currency = patch.currency !== undefined ? patch.currency : existing.currency
    invoiceUpdate.purchase_order_number =
      patch.purchaseOrderNumber !== undefined
        ? patch.purchaseOrderNumber
        : existing.purchase_order_number
    invoiceUpdate.payment_terms =
      patch.paymentTerms !== undefined ? patch.paymentTerms : existing.payment_terms
    invoiceUpdate.accepted_methods =
      patch.acceptedMethods !== undefined ? patch.acceptedMethods : existing.accepted_methods
    invoiceUpdate.requires_signature =
      patch.requiresSignature !== undefined ? patch.requiresSignature : existing.requires_signature
    invoiceUpdate.signed_by = patch.signedBy !== undefined ? patch.signedBy : existing.signed_by

    invoiceUpdate.signature_date =
      Boolean(invoiceUpdate.requires_signature) && Boolean(invoiceUpdate.signed_by)
        ? invoiceUpdate.invoice_date
        : null

    if (patch.status !== undefined && existing.status === 'draft') {
      invoiceUpdate.status = patch.status
    }

    const { error: upErr } = await supabaseAdmin.from('invoices').update(invoiceUpdate).eq('id', invoiceId)

    if (upErr) {
      userLog.error({ err: upErr }, 'invoice draft update failed')
      throw AppError.internal('Failed to update invoice')
    }

    const { error: delErr } = await supabaseAdmin.from('invoice_items').delete().eq('invoice_id', invoiceId)

    if (delErr) {
      userLog.error({ err: delErr }, 'failed clearing items')
      throw AppError.internal('Failed to update line items')
    }

    const itemRows = totals.computedItems.map((item) => ({
      ...item,
      invoice_id: invoiceId,
    }))

    const { error: insErr } = await supabaseAdmin.from('invoice_items').insert(itemRows)

    if (insErr) {
      userLog.error({ err: insErr }, 'failed re-insert items')
      throw AppError.internal('Failed to save line items')
    }

    userLog.info({ invoiceId, durationMs: Date.now() - start }, 'draft invoice updated')

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    log.error({ err, durationMs: Date.now() - start }, 'PATCH invoice failed')
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Something went wrong' } },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/invoices/[id]
 */
export async function DELETE(request, { params }) {
  const start = Date.now()
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const route = `DELETE /api/invoices/${params.id}`
  const log = createRequestLogger({ requestId, route })

  try {
    const { companyId, userLog } = await authenticate(request, log)
    const invoiceId = params.id

    const { data: existing, error: loadErr } = await supabaseAdmin
      .from('invoices')
      .select('id, status')
      .eq('id', invoiceId)
      .eq('company_id', companyId)
      .single()

    if (loadErr?.code === 'PGRST116' || !existing) throw AppError.notFound('Invoice not found')

    if (!['draft', 'rejected'].includes(existing.status)) {
      throw AppError.badRequest('Only draft or rejected invoices can be deleted')
    }

    const { error: delErr } = await supabaseAdmin.from('invoices').delete().eq('id', invoiceId)

    if (delErr) {
      userLog.error({ err: delErr }, 'invoice delete failed')
      throw AppError.internal('Failed to delete invoice')
    }

    userLog.info({ invoiceId, durationMs: Date.now() - start }, 'invoice deleted')
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    log.error({ err }, 'DELETE invoice failed')
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Something went wrong' } },
      { status: 500 },
    )
  }
}
