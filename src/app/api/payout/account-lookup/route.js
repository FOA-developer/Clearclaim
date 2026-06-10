import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AppError } from '@/lib/errors/AppError'
import { lookupAccount } from '@/lib/services/squadPayment'

export const runtime = 'nodejs'

async function authenticate() {
  const cookieClient = await createClient()
  const { data: { user }, error: authError } = await cookieClient.auth.getUser()
  if (authError || !user) throw AppError.unauthorized()
  return user.id
}

/**
 * POST /api/payout/account-lookup
 *
 * Body: { bankCode: string, accountNumber: string }
 * Returns: { accountName, accountNumber } from Squad
 */
export async function POST(request) {
  try {
    await authenticate()

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      throw AppError.badRequest('Request body must be valid JSON')
    }

    const { bankCode, accountNumber } = body
    if (!bankCode || typeof bankCode !== 'string') {
      throw AppError.badRequest('bankCode is required')
    }
    if (!accountNumber || typeof accountNumber !== 'string') {
      throw AppError.badRequest('accountNumber is required')
    }
    if (!/^\d{10}$/.test(accountNumber)) {
      throw AppError.badRequest('accountNumber must be a 10-digit NUBAN')
    }

    const result = await lookupAccount({ bankCode, accountNumber })

    return NextResponse.json({
      success: true,
      accountName: result.accountName,
      accountNumber: result.accountNumber,
    })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    console.error('Account lookup error:', err)
    return NextResponse.json(
      { error: { code: 'PAYOUT_FAILED', message: err.message || 'Account lookup failed' } },
      { status: err.status || 500 },
    )
  }
}
