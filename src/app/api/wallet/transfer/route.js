import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'
import { transferFunds } from '@/lib/services/squad'
import { z } from 'zod'

const transferSchema = z.object({
  bankCode: z
    .string({ required_error: 'Bank code is required' })
    .min(3, 'Invalid bank code'),
  accountNumber: z
    .string({ required_error: 'Account number is required' })
    .regex(/^\d{10}$/, 'Account number must be exactly 10 digits'),
  accountName: z
    .string({ required_error: 'Account name is required' })
    .min(2, 'Account name too short'),
  amount: z
    .number({ required_error: 'Amount is required' })
    .positive('Amount must be positive')
    .max(50_000_000, 'Amount exceeds maximum limit'),
  remark: z
    .string()
    .max(100, 'Remark too long')
    .optional()
    .default('ClearClaim Transfer'),
})

/**
 * POST /api/wallet/transfer
 *
 * Initiates a fund transfer from the merchant's Squad wallet to a bank account.
 * Amount is accepted in NAIRA and converted to KOBO for the Squad API.
 *
 * Flow:
 *   1. Authenticate the user.
 *   2. Validate input (Zod strict).
 *   3. Load user's company + generate a unique transaction reference.
 *   4. Insert a "pending" row in the transfers table (audit trail).
 *   5. Call Squad Transfer API.
 *   6. Update the transfers row with the result (success/fail).
 */
export async function POST(request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'POST /api/wallet/transfer' })

  try {
    const cookieClient = await createClient()
    const { data: { user }, error: authError } = await cookieClient.auth.getUser()

    if (authError || !user) {
      throw AppError.unauthorized()
    }

    const userLog = log.child({ userId: user.id })

    const body = await request.json()
    const parsed = transferSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Validation failed'
      throw AppError.badRequest(firstError)
    }

    const { bankCode, accountNumber, accountName, amount, remark } = parsed.data

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile?.company_id) {
      throw AppError.forbidden('Complete onboarding to use wallet')
    }

    const merchantId = process.env.SQUAD_MERCHANT_ID || 'CLEARCLAIM'
    const uniqueId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const transactionReference = `${merchantId}_${uniqueId}`

    const amountKobo = String(Math.round(amount * 100))

    const { error: insertErr } = await supabaseAdmin
      .from('transfers')
      .insert({
        company_id: profile.company_id,
        profile_id: user.id,
        transaction_reference: transactionReference,
        amount_kobo: parseInt(amountKobo, 10),
        bank_code: bankCode,
        account_number: accountNumber,
        account_name: accountName,
        remark,
        status: 'pending',
      })

    if (insertErr) {
      userLog.error({ err: insertErr }, 'Failed to insert transfer record')
      throw AppError.internal('Failed to initiate transfer')
    }

    let transferResult
    try {
      transferResult = await transferFunds(
        {
          transactionReference,
          amount: amountKobo,
          bankCode,
          accountNumber,
          accountName,
          remark,
        },
        userLog,
      )
    } catch (squadErr) {
      await supabaseAdmin
        .from('transfers')
        .update({ status: 'failed', raw_response: { error: squadErr.message }, updated_at: new Date().toISOString() })
        .eq('transaction_reference', transactionReference)

      throw squadErr
    }

    const hasNipRef = !!transferResult.nipReference
    const finalStatus = hasNipRef ? 'success' : 'pending'

    await supabaseAdmin
      .from('transfers')
      .update({
        status: finalStatus,
        nip_transaction_reference: transferResult.nipReference,
        destination_bank: transferResult.destinationBank,
        raw_response: transferResult.rawResponse,
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_reference', transactionReference)

    return NextResponse.json({
      transactionReference,
      status: finalStatus,
      amount,
      accountNumber,
      accountName,
      destinationBank: transferResult.destinationBank,
    })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    log.error({ err }, 'Unexpected error in POST /api/wallet/transfer')
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Something went wrong' } },
      { status: 500 },
    )
  }
}
