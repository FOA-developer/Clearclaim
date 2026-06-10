import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'
import { decryptBVN } from '@/lib/encryption'
import { createBusinessVirtualAccount } from '@/lib/services/squad'

/**
 * POST /api/wallet/setup
 *
 * Retries Squad virtual account creation for users who completed
 * onboarding but whose Squad call failed. Decrypts the stored BVN,
 * calls Squad, and stores the result.
 *
 * Accepts optional { beneficiaryAccount } in the request body —
 * a 10-digit GTBank account for settlements.
 */
export async function POST(request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'POST /api/wallet/setup' })

  try {
    const cookieClient = await createClient()
    const { data: { user }, error: authError } = await cookieClient.auth.getUser()

    if (authError || !user) {
      throw AppError.unauthorized()
    }

    const userLog = log.child({ userId: user.id })

    let body = {}
    try { body = await request.json() } catch { /* empty body is fine */ }
    const beneficiaryAccount = body.beneficiaryAccount ?? null

    if (beneficiaryAccount && !/^\d{10}$/.test(beneficiaryAccount)) {
      throw AppError.badRequest('Beneficiary account must be a 10-digit GTBank account number')
    }

    const [profileResult, existingVA] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('company_id, bvn_encrypted, phone_number')
        .eq('id', user.id)
        .single(),
      supabaseAdmin
        .from('virtual_accounts')
        .select('id, virtual_account_number')
        .eq('profile_id', user.id)
        .maybeSingle(),
    ])

    if (profileResult.error || !profileResult.data?.company_id) {
      throw AppError.forbidden('Complete onboarding first')
    }

    if (existingVA.data) {
      return NextResponse.json({
        message: 'Virtual account already exists',
        virtualAccount: {
          accountNumber: existingVA.data.virtual_account_number,
          bankName: 'GTBank',
        },
      })
    }

    const profile = profileResult.data

    if (!profile.bvn_encrypted || !profile.phone_number) {
      throw AppError.badRequest('BVN and phone number are required — please complete onboarding')
    }

    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('name')
      .eq('id', profile.company_id)
      .single()

    const bvn = decryptBVN(profile.bvn_encrypted)
    const customerIdentifier = `CC_${profile.company_id}`

    const squadResult = await createBusinessVirtualAccount(
      {
        bvn,
        businessName: company?.name ?? 'ClearClaim Business',
        customerIdentifier,
        mobileNum: profile.phone_number,
        beneficiaryAccount,
      },
      userLog,
    )

    const { error: insertErr } = await supabaseAdmin
      .from('virtual_accounts')
      .insert({
        company_id: profile.company_id,
        profile_id: user.id,
        customer_identifier: customerIdentifier,
        virtual_account_number: squadResult.virtualAccountNumber,
        bank_code: squadResult.bankCode,
        beneficiary_account: squadResult.beneficiaryAccount,
        raw_response: squadResult.rawResponse,
      })

    if (insertErr) {
      userLog.error({ err: insertErr }, 'Failed to store virtual account')
      throw AppError.internal('Virtual account created but failed to save — contact support')
    }

    userLog.info({ accountNumber: squadResult.virtualAccountNumber }, 'Virtual account created via retry')

    return NextResponse.json({
      message: 'Virtual account created successfully',
      virtualAccount: {
        accountNumber: squadResult.virtualAccountNumber,
        bankCode: squadResult.bankCode,
        bankName: 'GTBank',
      },
    })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    log.error({ err }, 'Unexpected error in POST /api/wallet/setup')
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Something went wrong' } },
      { status: 500 },
    )
  }
}
