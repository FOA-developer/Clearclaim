import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'
import { getLedgerBalance } from '@/lib/services/squad'

/**
 * GET /api/wallet/balance
 *
 * Returns the merchant's Squad wallet balance along with the
 * user's virtual account details for the "Receive" panel.
 *
 * Latency target: <300ms (single Squad API call + 1 DB read, run concurrently).
 */
export async function GET(request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'GET /api/wallet/balance' })

  try {
    const cookieClient = await createClient()
    const { data: { user }, error: authError } = await cookieClient.auth.getUser()

    if (authError || !user) {
      throw AppError.unauthorized()
    }

    const userLog = log.child({ userId: user.id })

    const [balanceResult, profileResult] = await Promise.all([
      getLedgerBalance(userLog),
      supabaseAdmin
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single(),
    ])

    if (profileResult.error || !profileResult.data?.company_id) {
      throw AppError.forbidden('Complete onboarding to access wallet')
    }

    const [vaResult, companyResult] = await Promise.all([
      supabaseAdmin
        .from('virtual_accounts')
        .select('virtual_account_number, bank_code, customer_identifier')
        .eq('company_id', profileResult.data.company_id)
        .single(),
      supabaseAdmin
        .from('companies')
        .select('name')
        .eq('id', profileResult.data.company_id)
        .single(),
    ])

    const virtualAccount = vaResult.data

    return NextResponse.json({
      balance: {
        amountKobo: balanceResult.balanceKobo,
        amountNaira: balanceResult.balanceKobo / 100,
        currency: balanceResult.currencyId,
      },
      virtualAccount: virtualAccount
        ? {
            accountNumber: virtualAccount.virtual_account_number,
            bankCode: virtualAccount.bank_code,
            bankName: 'GTBank',
            accountName: companyResult.data?.name ?? null,
          }
        : null,
    })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    log.error({ err }, 'Unexpected error in GET /api/wallet/balance')
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Something went wrong' } },
      { status: 500 },
    )
  }
}
