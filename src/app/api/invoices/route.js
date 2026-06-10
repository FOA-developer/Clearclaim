import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'
import { createInvoiceSchema } from '@/lib/validation/invoice'
import {
  buildSellerFromCompany,
  computeTotalsFromLineInput,
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

async function generateInvoiceNumber(companyId, year) {
  const y = Number.isFinite(year) ? Math.floor(year) : new Date().getFullYear()
  const prefix = `INV-${y}-`

  const { data } = await supabaseAdmin
    .from('invoices')
    .select('invoice_number')
    .eq('company_id', companyId)
    .like('invoice_number', `${prefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1)

  let seq = 1
  if (data?.length) {
    const lastNum = Number.parseInt(String(data[0].invoice_number).replace(prefix, ''), 10)
    if (!Number.isNaN(lastNum)) seq = lastNum + 1
  }

  return `${prefix}${String(seq).padStart(6, '0')}`
}

async function fetchStatusCounts(companyId) {
  const statuses = ['draft', 'pending', 'approved', 'rejected', 'paid']
  const results = await Promise.all(
    statuses.map(async (status) => {
      const r = await supabaseAdmin
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', status)
      return { status, count: r.count ?? 0 }
    }),
  )

  /** @type {Record<string, number>} */
  const byStatus = {}
  let total = 0
  for (const { status, count } of results) {
    byStatus[status] = count
    total += count
  }
  byStatus.all = total
  return byStatus
}

/**
 * POST /api/invoices — Create a new invoice.
 */
export async function POST(request) {
  const start = Date.now()
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'POST /api/invoices' })

  try {
    const { userId, companyId, userLog } = await authenticate(request, log)

    const body = await request.json().catch(() => null)
    if (!body) throw AppError.badRequest('Request body must be valid JSON')

    const parsed = createInvoiceSchema.safeParse(body)
    if (!parsed.success) {
      throw AppError.badRequest('Validation failed', {
        issues: parsed.error.flatten().fieldErrors,
      })
    }
    const input = parsed.data

    const invYear = new Date(`${input.invoiceDate}T00:00:00`).getFullYear()
    if (!Number.isFinite(invYear)) {
      throw AppError.badRequest('Invalid invoiceDate')
    }

    const [company, invoiceNumber] = await Promise.all([
      supabaseAdmin
        .from('companies')
        .select('name, cac_number, tin, vat_number, address, contact, bank_details')
        .eq('id', companyId)
        .single()
        .then((r) => {
          if (r.error || !r.data) throw AppError.internal('Failed to fetch company data')
          return r.data
        }),
      generateInvoiceNumber(companyId, invYear),
    ])

    const seller = buildSellerFromCompany(company)
    const totals = computeTotalsFromLineInput(
      input.items,
      input.discount,
      input.withholdingTaxRate,
    )

    const invoiceRow = {
      company_id: companyId,
      invoice_number: invoiceNumber,
      invoice_date: input.invoiceDate,
      due_date: input.dueDate,
      currency: input.currency,
      status: input.initialStatus ?? 'pending',
      purchase_order_number: input.purchaseOrderNumber || null,
      seller,
      buyer: input.buyer,
      subtotal: totals.subtotal,
      discount: totals.discount,
      vat_amount: totals.vatAmount,
      withholding_tax_rate: totals.withholdingTaxRate,
      withholding_tax_amount: totals.withholdingTaxAmount,
      grand_total: totals.grandTotal,
      net_payable: totals.netPayable,
      payment_terms: input.paymentTerms,
      accepted_methods: input.acceptedMethods,
      payment_reference: invoiceNumber,
      firs_compliant: true,
      requires_signature: input.requiresSignature,
      signed_by: input.signedBy || null,
      signature_date:
        input.requiresSignature && input.signedBy
          ? input.invoiceDate
          : null,
      source: 'web_app',
      created_by: userId,
    }

    const { data: invoice, error: insertError } = await supabaseAdmin
      .from('invoices')
      .insert(invoiceRow)
      .select('id')
      .single()

    if (insertError) {
      userLog.error({ err: insertError }, 'Failed to insert invoice')
      throw AppError.internal('Failed to create invoice')
    }

    const itemRows = totals.computedItems.map((item) => ({
      ...item,
      invoice_id: invoice.id,
    }))

    const { error: itemsError } = await supabaseAdmin.from('invoice_items').insert(itemRows)

    if (itemsError) {
      userLog.error({ err: itemsError }, 'Failed to insert invoice items')
      await supabaseAdmin.from('invoices').delete().eq('id', invoice.id)
      throw AppError.internal('Failed to create invoice items')
    }

    userLog.info(
      { invoiceId: invoice.id, invoiceNumber, durationMs: Date.now() - start },
      'Invoice created',
    )

    return NextResponse.json(
      { id: invoice.id, invoiceNumber, status: input.initialStatus ?? 'pending' },
      { status: 201 },
    )
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    log.error({ err, durationMs: Date.now() - start }, 'Unhandled error creating invoice')
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Something went wrong' } },
      { status: 500 },
    )
  }
}

function sanitizeSearchToken(raw) {
  return String(raw)
    .replace(/[^\w\s.@+-]/gi, '')
    .slice(0, 120)
}

/**
 * GET /api/invoices — List invoices scoped to the authenticated user's company.
 *
 * Query (all optional except as noted):
 * - `page` — 1-based page index (default 1)
 * - `limit` — page size, max 100 (default 20)
 * - `offset` — if set, overrides `page` via `page = floor(offset / limit) + 1`
 * - `status` — draft | pending | approved | rejected | paid
 * - `search` — ilike on `invoice_number`
 * - `includeCounts=1` — include `statusCounts` for tab badges
 */
export async function GET(request) {
  const start = Date.now()
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'GET /api/invoices' })

  try {
    const { companyId, userLog } = await authenticate(request, log)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    let page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10))
    const limitRaw = Number.parseInt(searchParams.get('limit') ?? '20', 10)
    const limit = Math.min(100, Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 20))

    /** Optional explicit offset — if provided without page, derives page */
    const offsetParam = searchParams.get('offset')
    if (offsetParam !== null) {
      const offset = Math.max(0, Number.parseInt(offsetParam, 10))
      if (!Number.isNaN(offset)) {
        page = Math.max(1, Math.floor(offset / limit) + 1)
      }
    }
    const searchRaw = searchParams.get('search')
    const includeCounts = searchParams.get('includeCounts') === '1'
    const search = searchRaw ? sanitizeSearchToken(searchRaw) : ''
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabaseAdmin
      .from('invoices')
      .select('id, invoice_number, invoice_date, due_date, status, buyer, grand_total, net_payable, currency, created_at', {
        count: 'exact',
      })
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status && ['draft', 'pending', 'approved', 'rejected', 'paid'].includes(status)) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.ilike('invoice_number', `%${search}%`)
    }

    const [{ data, error, count }, statusCounts] = await Promise.all([
      query,
      includeCounts ? fetchStatusCounts(companyId) : Promise.resolve(null),
    ])

    if (error) {
      userLog.error({ err: error }, 'Failed to list invoices')
      throw AppError.internal('Failed to fetch invoices')
    }

    userLog.info({ count, page, durationMs: Date.now() - start }, 'Invoices listed')

    const total = count ?? 0
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit)
    const offset = (page - 1) * limit

    /** Clamp page if out of range (empty result but helpful metadata). */
    if (totalPages > 0 && page > totalPages) {
      throw AppError.badRequest(
        `Invalid page (${page}); last page for this filter is ${totalPages}`,
      )
    }

    const hasNextPage = totalPages > 0 && page < totalPages
    const hasPrevPage = totalPages > 0 && page > 1

    const payload = {
      invoices: data ?? [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        offset,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      },
      ...(statusCounts ? { statusCounts } : {}),
    }

    return NextResponse.json(payload)
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    log.error({ err, durationMs: Date.now() - start }, 'Unhandled error listing invoices')
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Something went wrong' } },
      { status: 500 },
    )
  }
}
