import crypto from 'crypto'

function randomPassword() {
  return crypto.randomBytes(48).toString('base64url').slice(0, 72)
}

/**
 * Create an Auth user without sending Supabase invitation email, align profile row.
 * Optionally returns an admin-visible magic link (`generateLink` does not dispatch email).
 *
 * `onboarded: true` so directory-only joins do not re-run company onboarding.
 */
export async function provisionStaffWithoutEmail({
  supabaseAdmin,
  email,
  fullName,
  role,
  department,
  phone,
  accountName,
  accountNumber,
  bankName,
  bankCode,
  companyId,
  actingUserId,
  redirectTo,
  generateMagicLink = true,
}) {
  const trimmedEmail = email.trim().toLowerCase()
  const trimmedName = (fullName ?? '').trim()
  if (!trimmedName) {
    return {
      ok: false,
      error: { kind: 'VALIDATION', message: 'Staff name is required' },
    }
  }

  let userId = null
  let alreadyExisted = false

  const { data: authData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: trimmedEmail,
    password: randomPassword(),
    email_confirm: true,
    user_metadata: {
      full_name: trimmedName,
      role,
      department: department ?? '',
      phone: phone ?? '',
      account_name: accountName ?? '',
      account_number: accountNumber ?? '',
      bank_name: bankName ?? '',
      bank_code: bankCode ?? '',
      company_id: companyId,
      invited_by: actingUserId ?? null,
      status: 'active',
    },
  })

  if (createErr) {
    const msg = createErr.message ?? ''
    const isConflict = msg.includes('already') || msg.includes('registered')

    if (isConflict) {
      // Email exists in Auth — look up the existing user and attach to this company
      const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
        perPage: 100,
      })

      if (!listErr && listData?.users?.length) {
        const existing = listData.users.find(
          (u) => u.email?.toLowerCase() === trimmedEmail,
        )
        if (existing?.id) {
          userId = existing.id
          alreadyExisted = true
        }
      }

      if (!userId) {
        return {
          ok: false,
          error: {
            kind: 'CONFLICT',
            message: 'This email is already registered but could not be linked to this company',
          },
        }
      }
    } else {
      return {
        ok: false,
        error: {
          kind: 'AUTH',
          message: msg || 'Failed to create staff account',
        },
      }
    }
  } else {
    userId = authData?.user?.id
  }

  if (!userId) {
    return { ok: false, error: { kind: 'AUTH', message: 'Auth user creation returned no ID' } }
  }

  // If this Auth user already had a profile in this company, that's a true conflict
  if (alreadyExisted) {
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .eq('company_id', companyId)
      .maybeSingle()

    if (existingProfile) {
      return {
        ok: false,
        error: {
          kind: 'CONFLICT',
          message: 'A staff member with this email already exists in your company',
        },
      }
    }
  }

  const { error: profileErr } = await supabaseAdmin.from('profiles').upsert(
    {
      id: userId,
      email: trimmedEmail,
      full_name: trimmedName,
      role,
      department: department ?? '',
      phone_number: phone ?? '',
      account_name: accountName ?? '',
      account_number: accountNumber ?? '',
      bank_name: bankName ?? '',
      bank_code: bankCode ?? '',
      company_id: companyId,
      status: 'active',
      onboarded: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )

  if (profileErr) {
    // Only rollback Auth user if we created it — never delete a pre-existing Auth user
    if (!alreadyExisted) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId)
      } catch (rollbackErr) {
        console.warn(
          '[provisionStaffWithoutEmail] Auth user rollback failed after profile upsert error; orphan user may remain:',
          rollbackErr?.message ?? rollbackErr,
        )
      }
    }
    const raw = profileErr.message ?? 'Failed to save staff profile'
    const hint =
      /column/i.test(raw) || /schema cache/i.test(raw)
        ? ' Apply supabase/migrations/20260516120000_profiles_staff_bank_columns.sql (or reload PostgREST schema).'
        : ''
    return {
      ok: false,
      error: { kind: 'PROFILE', message: raw + hint },
    }
  }

  /** @type {string | null} */
  let magicLink = null
  if (generateMagicLink && typeof supabaseAdmin.auth.admin.generateLink === 'function') {
    const base = redirectTo ?? ''
    try {
      const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: trimmedEmail,
        ...(base ? { options: { redirectTo: base } } : {}),
      })
      if (!linkErr && linkData) {
        const props = linkData.properties ?? {}
        magicLink =
          props.action_link ?? props.href ?? linkData.properties?.confirmation_url ?? null
      }
    } catch {
      magicLink = null
    }
  }

  return { ok: true, userId, magicLink, email: trimmedEmail }
}
