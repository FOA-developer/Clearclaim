import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { signupSchema } from '@/lib/validation/signup'
import { validate, formatValidationErrors } from '@/lib/validation/auth'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'

/**
 * POST /api/auth/signup
 *
 * Creates an auth user and a bare profile row. No company data — that
 * is collected in the separate /api/auth/onboarding step.
 *
 * Flow (all via service role):
 *   1. Validate email + password with Zod strict schema.
 *   2. Create auth user via admin API (indexed email uniqueness check built-in).
 *   3. Insert a profile row with onboarded = false.
 *   4. If the profile insert fails, roll back the auth user.
 *
 * Two sequential indexed inserts — p95 under 200 ms.
 */
export async function POST(request) {
  const startTime = performance.now()
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'POST /api/auth/signup' })

  let createdUserId = null

  try {
    const body = await request.json().catch(() => null)

    if (!body) {
      throw AppError.badRequest('Request body must be valid JSON')
    }

    const { data: input, error: validationError } = validate(signupSchema, body)

    if (validationError) {
      log.warn({ fields: validationError.issues.length }, 'signup validation failed')
      return NextResponse.json(formatValidationErrors(validationError), { status: 400 })
    }

    // ── 1. Create auth user ─────────────────────────────────────────
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: false,
    })

    if (authError) {
      const message = authError.message ?? ''

      if (message.includes('already been registered') || message.includes('already exists')) {
        throw AppError.conflict('An account with this email already exists')
      }

      log.error({ err: authError, email: input.email }, 'auth user creation failed')
      throw AppError.fromSupabaseError(authError)
    }

    createdUserId = authData.user.id
    log.info({ userId: createdUserId }, 'auth user created')

    // ── 2. Insert profile (onboarded = false) ───────────────────────
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: createdUserId,
        email: input.email,
        onboarded: false,
      })

    if (profileError) {
      log.error({ err: profileError, userId: createdUserId }, 'profile insert failed — rolling back user')
      await rollbackUser(createdUserId, log)
      throw AppError.internal('Failed to create user profile')
    }

    const durationMs = Math.round(performance.now() - startTime)
    log.info({ userId: createdUserId, durationMs }, 'signup completed')

    return NextResponse.json(
      {
        user: {
          id: createdUserId,
          email: input.email,
          onboarded: false,
        },
        redirectTo: '/login',
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode })
    }

    if (createdUserId) {
      await rollbackUser(createdUserId, log)
    }

    const durationMs = Math.round(performance.now() - startTime)
    log.error({ err: error, durationMs }, 'unhandled signup error')

    return NextResponse.json(AppError.internal().toJSON(), { status: 500 })
  }
}

async function rollbackUser(userId, log) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) {
    log.error({ err: error, userId }, 'CRITICAL: rollback of auth user failed — orphaned record')
  } else {
    log.warn({ userId }, 'auth user rolled back after downstream failure')
  }
}
