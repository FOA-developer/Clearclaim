import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'

/**
 * GET /api/wallet/transactions
 *
 * Returns both credits (incoming via webhook → transactions table) and
 * debits (outgoing transfers → transfers table) unified into a single
 * chronologically-sorted list.
 *
 * Query params:
 *   - page (default 1)
 *   - limit (default 20, max 100)
 *   - type: 'credit' | 'debit' | 'all' (default 'all')
 *
 * Complexity: O(n log n) for the merge-sort of two already-sorted arrays.
 * Two DB queries run concurrently via Promise.all.
 */
export async function GET(request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'GET /api/wallet/transactions' })

  try {
    const cookieClient = await createClient()
    const { data: { user }, error: authError } = await cookieClient.auth.getUser()

    if (authError || !user) {
      throw AppError.unauthorized()
    }

    const userLog = log.child({ userId: user.id })

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile?.company_id) {
      throw AppError.forbidden('Complete onboarding to view transactions')
    }

    const companyId = profile.company_id

    const url = new URL(request.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10)))
    const typeFilter = url.searchParams.get('type') ?? 'all'

    const fetchCredits = typeFilter !== 'debit'
    const fetchDebits = typeFilter !== 'credit'

    let virtualAccountIds = []
    if (fetchCredits) {
      const { data: vaRows } = await supabaseAdmin
        .from('virtual_accounts')
        .select('id')
        .eq('company_id', companyId)

      virtualAccountIds = (vaRows ?? []).map((r) => r.id)
    }

    const [creditsResult, debitsResult] = await Promise.all([
      fetchCredits && virtualAccountIds.length > 0
        ? supabaseAdmin
            .from('transactions')
            .select('*')
            .in('virtual_account_id', virtualAccountIds)
            .order('created_at', { ascending: false })
            .range(0, 199)
        : { data: [], error: null },
      fetchDebits
        ? supabaseAdmin
            .from('transfers')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
            .range(0, 199)
        : { data: [], error: null },
    ])

    if (creditsResult.error) {
      userLog.error({ err: creditsResult.error }, 'Failed to fetch credit transactions')
    }
    if (debitsResult.error) {
      userLog.error({ err: debitsResult.error }, 'Failed to fetch debit transactions')
    }

    const credits = (creditsResult.data ?? []).map((t) => ({
      id: t.id,
      type: 'credit',
      reference: t.transaction_reference,
      amount: parseFloat(t.principal_amount ?? '0'),
      settledAmount: parseFloat(t.settled_amount ?? '0'),
      fee: parseFloat(t.fee_charged ?? '0'),
      currency: t.currency ?? 'NGN',
      status: 'completed',
      description: t.remarks ?? 'Incoming payment',
      senderName: t.sender_name ?? null,
      date: t.created_at,
      channel: t.channel ?? 'virtual-account',
    }))

    const debits = (debitsResult.data ?? []).map((t) => ({
      id: t.id,
      type: 'debit',
      reference: t.transaction_reference,
      amount: t.amount_kobo / 100,
      settledAmount: t.amount_kobo / 100,
      fee: 0,
      currency: t.currency ?? 'NGN',
      status: t.status,
      description: t.remark ?? 'Outgoing transfer',
      recipientName: t.account_name ?? null,
      recipientAccount: t.account_number ?? null,
      recipientBank: t.destination_bank ?? null,
      date: t.created_at,
      channel: 'transfer',
    }))

    const merged = [...credits, ...debits].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    const start = (page - 1) * limit
    const paginated = merged.slice(start, start + limit)

    return NextResponse.json({
      transactions: paginated,
      pagination: {
        page,
        limit,
        total: merged.length,
        totalPages: Math.ceil(merged.length / limit),
      },
    })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    log.error({ err }, 'Unexpected error in GET /api/wallet/transactions')
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Something went wrong' } },
      { status: 500 },
    )
  }
}
