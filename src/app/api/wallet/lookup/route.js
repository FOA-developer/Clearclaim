import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'
import { lookupAccount } from '@/lib/services/squad'
import { z } from 'zod'

const lookupSchema = z.object({
  bankCode: z
    .string({ required_error: 'Bank code is required' })
    .min(3, 'Invalid bank code'),
  accountNumber: z
    .string({ required_error: 'Account number is required' })
    .regex(/^\d{10}$/, 'Account number must be exactly 10 digits'),
})

/**
 * POST /api/wallet/lookup
 *
 * Verifies a recipient's bank account name before initiating a transfer.
 * Calls the Squad Account Lookup API.
 */
export async function POST(request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'POST /api/wallet/lookup' })

  try {
    const cookieClient = await createClient()
    const { data: { user }, error: authError } = await cookieClient.auth.getUser()

    if (authError || !user) {
      throw AppError.unauthorized()
    }

    const body = await request.json()
    const parsed = lookupSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Validation failed'
      throw AppError.badRequest(firstError)
    }

    const { bankCode, accountNumber } = parsed.data

    const result = await lookupAccount(bankCode, accountNumber, log.child({ userId: user.id }))

    return NextResponse.json({
      accountName: result.accountName,
      accountNumber: result.accountNumber,
    })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    log.error({ err }, 'Unexpected error in POST /api/wallet/lookup')
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Something went wrong' } },
      { status: 500 },
    )
  }
}
