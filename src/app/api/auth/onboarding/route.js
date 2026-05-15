import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { onboardingSchema } from '@/lib/validation/onboarding'
import { validate, formatValidationErrors } from '@/lib/validation/auth'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'
import { encryptBVN, hashSHA256 } from '@/lib/encryption'
import { createBusinessVirtualAccount } from '@/lib/services/squad'

/**
 * POST /api/auth/onboarding
 *
 * Completes a signed-up user's company profile. Requires an active session.
 *
 * Flow:
 *   1. Authenticate via session cookie.
 *   2. Guard against duplicate onboarding.
 *   3. Validate all inputs (name, company, BVN, phone) via Zod strict schema.
 *   4. Encrypt BVN (AES-256-GCM) and compute SHA-256 hash for dedup.
 *   5. Insert company row.
 *   6. Update profile with company link, BVN cipher, hash, and phone.
 *   7. Call Squad API to create a business virtual account (non-blocking on failure).
 *   8. Store virtual account details if Squad succeeds.
 *
 * DB writes are sequential (profile depends on company.id).
 * Squad call is fire-and-forget-safe: onboarding completes even if Squad is down.
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

    const userLog = log.child({ userId: user.id })

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
      userLog.warn({ fields: validationError.issues.length }, 'onboarding validation failed')
      return NextResponse.json(formatValidationErrors(validationError), { status: 400 })
    }

    // ── 4. Encrypt BVN ──────────────────────────────────────────────
    const bvnEncrypted = encryptBVN(input.bvn)
    const bvnHash = hashSHA256(input.bvn)

    const { data: existingBvn } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('bvn_hash', bvnHash)
      .neq('id', user.id)
      .maybeSingle()

    if (existingBvn) {
      throw AppError.conflict('This BVN is already associated with another account')
    }

    // ── 5. Insert company ───────────────────────────────────────────
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        name: input.companyName,
        size: input.companySize,
        revenue: input.companyRevenue,
        owner_id: user.id,
      })
      .select('id')
      .single()

    if (companyError) {
      if (companyError.code === '23505') {
        throw AppError.conflict('A company is already registered to this account')
      }
      userLog.error({ err: companyError }, 'company insert failed')
      throw AppError.internal('Failed to create company record')
    }

    // ── 6. Update profile ───────────────────────────────────────────
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: input.ownerName,
        company_id: company.id,
        signer_role: input.signerRole,
        bvn_encrypted: bvnEncrypted,
        bvn_hash: bvnHash,
        phone_number: input.phoneNumber,
        onboarded: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (profileError) {
      userLog.error({ err: profileError }, 'profile update failed after company insert')

      await supabaseAdmin.from('companies').delete().eq('id', company.id)
      userLog.warn({ companyId: company.id }, 'orphaned company rolled back')

      throw AppError.internal('Failed to update user profile')
    }

    // ── 7. Update app_metadata ──────────────────────────────────────
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { full_name: input.ownerName },
      app_metadata: { signer_role: input.signerRole, onboarded: true },
    })

    // ── 8. Create Squad virtual account (non-blocking on failure) ──
    let virtualAccount = null
    const customerIdentifier = `CC_${company.id}`

    try {
      const squadResult = await createBusinessVirtualAccount(
        {
          bvn: input.bvn,
          businessName: input.companyName,
          customerIdentifier,
          mobileNum: input.phoneNumber,
          beneficiaryAccount: input.beneficiaryAccount,
        },
        userLog,
      )

      const { error: vaError } = await supabaseAdmin
        .from('virtual_accounts')
        .insert({
          company_id: company.id,
          profile_id: user.id,
          customer_identifier: customerIdentifier,
          virtual_account_number: squadResult.virtualAccountNumber,
          bank_code: squadResult.bankCode,
          beneficiary_account: squadResult.beneficiaryAccount,
          raw_response: squadResult.rawResponse,
        })

      if (vaError) {
        userLog.error({ err: vaError }, 'virtual_accounts insert failed — Squad account created but not stored')
      } else {
        virtualAccount = {
          accountNumber: squadResult.virtualAccountNumber,
          bankCode: squadResult.bankCode,
          customerIdentifier,
        }
        userLog.info({ virtualAccountNumber: squadResult.virtualAccountNumber }, 'virtual account created')
      }
    } catch (squadError) {
      userLog.error(
        { err: squadError },
        'Squad virtual account creation failed — onboarding continues without it',
      )
    }

    const durationMs = Math.round(performance.now() - startTime)
    userLog.info({ companyId: company.id, durationMs }, 'onboarding completed')

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
      ...(virtualAccount && { virtualAccount }),
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
