import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'
import { lookupAccount, transferFunds } from '@/lib/services/squadPayment'

export const runtime = 'nodejs'
export const maxDuration = 60

async function authenticate(request, log) {
  const cookieClient = await createClient()
  const { data: { user }, error: authError } = await cookieClient.auth.getUser()
  if (authError || !user) throw AppError.unauthorized()

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.company_id) {
    throw AppError.forbidden('Complete onboarding first')
  }

  return { userId: user.id, companyId: profile.company_id, userLog: log.child({ userId: user.id }) }
}

/**
 * POST /api/invoices/[id]/pay
 *
 * Initiates a Squad transfer to pay the vendor.
 *
 * Body: { bankCode, accountNumber, accountName }
 *
 * The invoice must be in "approved" status.
 */
export async function POST(request, { params: paramsPromise }) {
  const params = await paramsPromise
  const start = Date.now()
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'POST /api/invoices/[id]/pay' })

  try {
    const { companyId, userLog } = await authenticate(request, log)
    const invoiceId = params.id

    // Parse and validate body
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      throw AppError.badRequest('Request body must be valid JSON')
    }

    const { bankCode, accountNumber, accountName } = body
    if (!bankCode || typeof bankCode !== 'string') throw AppError.badRequest('bankCode is required')
    if (!accountNumber || !/^\d{10}$/.test(accountNumber)) {
      throw AppError.badRequest('A valid 10-digit accountNumber is required')
    }
    if (!accountName || typeof accountName !== 'string') throw AppError.badRequest('accountName is required')

    // Fetch invoice
    const { data: invoice, error: invErr } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('company_id', companyId)
      .single()

    if (invErr?.code === 'PGRST116' || !invoice) throw AppError.notFound('Invoice not found')
    if (invoice.status !== 'approved') {
      throw AppError.badRequest('Only approved invoices can be paid')
    }

    const netPayable = Number(invoice.net_payable)
    if (netPayable <= 0) {
      throw AppError.badRequest('Invoice net payable must be greater than zero')
    }

    // Convert naira to kobo (₦1 = 100 kobo)
    const amountKobo = String(Math.round(netPayable * 100))

    // Verify account name via lookup
    let verifiedName
    try {
      const lookup = await lookupAccount({ bankCode, accountNumber })
      verifiedName = lookup.accountName
    } catch (lookupErr) {
      userLog.warn({ err: lookupErr }, 'Squad account lookup failed')
      throw AppError.badRequest(
        'Could not verify bank account. Check the bank code and account number.',
      )
    }

    // Warn if account name doesn't match but still proceed
    if (verifiedName.toUpperCase() !== accountName.toUpperCase()) {
      userLog.warn(
        {
          providedName: accountName,
          verifiedName,
          accountNumber,
          bankCode,
        },
        'Account name mismatch – proceeding with verified name',
      )
    }

    // Build unique transaction reference
    const transactionRefSuffix = `${invoiceId.slice(0, 8)}_${Date.now()}`

    // Initiate Squad transfer
    let transferResult
    try {
      transferResult = await transferFunds({
        bankCode,
        accountNumber,
        accountName: verifiedName,
        amountKobo,
        remark: `ClearClaim-${invoice.invoice_number || invoiceId.slice(0, 8)}`,
        transactionRef: transactionRefSuffix,
      })
    } catch (transferErr) {
      userLog.error({ err: transferErr }, 'Squad transfer failed')
      throw AppError.internal(
        transferErr.message || 'Payment transfer failed. Please try again.',
      )
    }

    // Update invoice: set status to paid, store transfer reference
    const { error: updateErr } = await supabaseAdmin
      .from('invoices')
      .update({
        status: 'paid',
        payment_reference: transferResult.transactionRef,
      })
      .eq('id', invoiceId)

    if (updateErr) {
      userLog.error({ err: updateErr, transferResult }, 'Failed to update invoice after transfer')
      // Transfer went through but DB update failed – log and return partial success
      return NextResponse.json(
        {
          warning: 'Payment sent but invoice status update failed. Please check manually.',
          transfer: {
            transactionRef: transferResult.transactionRef,
            nipRef: transferResult.nipRef,
            status: transferResult.status,
          },
        },
        { status: 200 },
      )
    }

    userLog.info(
      {
        invoiceId,
        transactionRef: transferResult.transactionRef,
        nipRef: transferResult.nipRef,
        amountNaira: netPayable,
        durationMs: Date.now() - start,
      },
      'Invoice paid via Squad',
    )

    return NextResponse.json({
      success: true,
      message: 'Payment sent successfully',
      transfer: {
        transactionRef: transferResult.transactionRef,
        nipRef: transferResult.nipRef,
        status: transferResult.status,
        accountName: verifiedName,
        amountNaira: netPayable,
      },
    })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    log.error({ err, durationMs: Date.now() - start }, 'Pay invoice failed')
    return NextResponse.json(
      { error: { code: 'PAYMENT_FAILED', message: err.message || 'Payment failed' } },
      { status: err.status || 500 },
    )
  }
}
