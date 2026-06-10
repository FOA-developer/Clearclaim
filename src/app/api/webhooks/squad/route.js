import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { validateWebhookSignature } from '@/lib/services/squad'
import { createRequestLogger } from '@/lib/logger'

/**
 * POST /api/webhooks/squad
 *
 * Handles incoming payment notifications from Squad's virtual account service.
 *
 * Security:
 *   - Validates x-squad-signature (HMAC-SHA512 V3) before processing.
 *   - Idempotent: uses ON CONFLICT on transaction_reference to prevent duplicates.
 *
 * Performance:
 *   - Single DB upsert per webhook: O(1), well under 100ms at p95.
 *   - Returns 200 immediately to Squad regardless of DB outcome
 *     (Squad retries on non-200, so we only fail on invalid signatures).
 */
export async function POST(request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'POST /api/webhooks/squad' })

  try {
    const rawBody = await request.text()
    let payload

    try {
      payload = JSON.parse(rawBody)
    } catch {
      log.warn('webhook received with invalid JSON body')
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // ── 1. Validate signature ───────────────────────────────────────
    const signature = request.headers.get('x-squad-signature')

    if (!validateWebhookSignature(payload, signature)) {
      log.warn(
        { transactionRef: payload.transaction_reference },
        'webhook signature validation failed',
      )
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    log.info(
      {
        transactionRef: payload.transaction_reference,
        amount: payload.principal_amount,
        customerIdentifier: payload.customer_identifier,
      },
      'valid Squad webhook received',
    )

    // ── 2. Resolve virtual account ──────────────────────────────────
    const { data: virtualAccount } = await supabaseAdmin
      .from('virtual_accounts')
      .select('id')
      .eq('customer_identifier', payload.customer_identifier)
      .maybeSingle()

    // ── 3. Idempotent transaction insert ────────────────────────────
    const { error: insertError } = await supabaseAdmin
      .from('transactions')
      .upsert(
        {
          virtual_account_id: virtualAccount?.id ?? null,
          transaction_reference: payload.transaction_reference,
          virtual_account_number: payload.virtual_account_number,
          principal_amount: parseFloat(payload.principal_amount),
          settled_amount: parseFloat(payload.settled_amount),
          fee_charged: parseFloat(payload.fee_charged || '0'),
          currency: payload.currency || 'NGN',
          transaction_date: payload.transaction_date,
          transaction_indicator: payload.transaction_indicator,
          customer_identifier: payload.customer_identifier,
          sender_name: payload.sender_name,
          remarks: payload.remarks,
          channel: payload.channel,
          raw_payload: payload,
        },
        { onConflict: 'transaction_reference', ignoreDuplicates: true },
      )

    if (insertError) {
      log.error(
        { err: insertError, transactionRef: payload.transaction_reference },
        'failed to store webhook transaction',
      )
    } else {
      log.info(
        { transactionRef: payload.transaction_reference },
        'webhook transaction stored',
      )
    }

    return NextResponse.json(
      {
        response_code: 200,
        transaction_reference: payload.transaction_reference,
        response_description: 'Success',
      },
      { status: 200 },
    )
  } catch (error) {
    log.error({ err: error }, 'unhandled webhook error')
    return NextResponse.json(
      { response_code: 500, response_description: 'Internal error' },
      { status: 200 },
    )
  }
}
