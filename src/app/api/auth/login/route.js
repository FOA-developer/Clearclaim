import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { loginSchema, validate, formatValidationErrors } from '@/lib/validation/auth'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'

/**
 * POST /api/auth/login
 *
 * 1. Validates input via Zod strict schema.
 * 2. Authenticates credentials via the cookie client (sets httpOnly session cookies).
 * 3. Upserts a user profile row via the admin client (service role, bypasses RLS).
 *
 * Two Supabase calls run in sequence (auth depends on success before DB write),
 * but each is a single indexed operation — p95 stays well under 300 ms.
 */
export async function POST(request) {
  const startTime = performance.now()
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'POST /api/auth/login' })

  try {
    const body = await request.json().catch(() => null)

    if (!body) {
      throw AppError.badRequest('Request body must be valid JSON')
    }

    const { data: credentials, error: validationError } = validate(loginSchema, body)

    if (validationError) {
      log.warn({ fields: validationError.issues.length }, 'login validation failed')
      return NextResponse.json(formatValidationErrors(validationError), { status: 400 })
    }

    const cookieClient = await createClient()

    const { data: authData, error: authError } = await cookieClient.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (authError) {
      const appError = AppError.fromSupabaseError(authError)
      log.warn({ code: appError.code, email: credentials.email }, 'login attempt failed')
      return NextResponse.json(appError.toJSON(), { status: appError.statusCode })
    }

    const user = authData.user

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email,
          last_sign_in_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )

    if (profileError) {
      log.error({ err: profileError, userId: user.id }, 'profile upsert failed — login still valid')
    }

    const durationMs = Math.round(performance.now() - startTime)
    log.info({ userId: user.id, durationMs }, 'login successful')

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode })
    }

    const durationMs = Math.round(performance.now() - startTime)
    log.error({ err: error, durationMs }, 'unhandled login error')

    return NextResponse.json(
      AppError.internal().toJSON(),
      { status: 500 },
    )
  }
}
