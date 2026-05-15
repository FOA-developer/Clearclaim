import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { onboardingSchema } from '@/lib/validation/onboarding'
import { validate, formatValidationErrors } from '@/lib/validation/auth'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'

/**
 * POST /api/auth/onboarding
 *
 * Completes a signed-up user's company profile. Requires an active session.
 *
 */
export async function POST(request) {
  const startTime = performance.now()
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'POST /api/auth/onboarding' })

  try {
    // ── 1. Authenticate ─────────────────────────────────────────────
    const cookieClient = await createClient()
    const { data: { user }, error: authError } = await cookieClient.auth.getUser()

    if (authError || !user) {
      throw AppError.unauthorized('You must be logged in to complete onboarding')
    }

    log.child({ userId: user.id })

    // ── 2. Guard: already onboarded? ────────────────────────────────
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('onboarded')
      .eq('id', user.id)
      .single()

    if (existingProfile?.onboarded) {
      throw AppError.conflict('Onboarding has already been completed for this account')
    }

    // ── 3. Validate input ───────────────────────────────────────────
    const body = await request.json().catch(() => null)

    if (!body) {
      throw AppError.badRequest('Request body must be valid JSON')
    }

    const { data: input, error: validationError } = validate(onboardingSchema, body)

    if (validationError) {
      log.warn({ fields: validationError.issues.length }, 'onboarding validation failed')
      return NextResponse.json(formatValidationErrors(validationError), { status: 400 })
    }

    // ── 4. Insert company ───────────────────────────────────────────
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        name: input.companyName,
        size: input.companySize,
        owner_id: user.id,
      })
      .select('id')
      .single()

    if (companyError) {
      if (companyError.code === '23505') {
        throw AppError.conflict('A company is already registered to this account')
      }
      log.error({ err: companyError, userId: user.id }, 'company insert failed')
      throw AppError.internal('Failed to create company record')
    }

    // ── 5. Update profile ───────────────────────────────────────────
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: input.ownerName,
        company_id: company.id,
        signer_role: input.signerRole,
        onboarded: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (profileError) {
      log.error({ err: profileError, userId: user.id }, 'profile update failed after company insert')

      await supabaseAdmin.from('companies').delete().eq('id', company.id)
      log.warn({ companyId: company.id }, 'orphaned company rolled back')

      throw AppError.internal('Failed to update user profile')
    }

    // ── 6. Update app_metadata with signer role ─────────────────────
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { full_name: input.ownerName },
      app_metadata: { signer_role: input.signerRole, onboarded: true },
    })

    const durationMs = Math.round(performance.now() - startTime)
    log.info({ userId: user.id, companyId: company.id, durationMs }, 'onboarding completed')

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: input.ownerName,
        signerRole: input.signerRole,
        onboarded: true,
      },
      company: {
        id: company.id,
        name: input.companyName,
        size: input.companySize,
      },
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode })
    }

    const durationMs = Math.round(performance.now() - startTime)
    log.error({ err: error, durationMs }, 'unhandled onboarding error')

    return NextResponse.json(AppError.internal().toJSON(), { status: 500 })
  }
}
