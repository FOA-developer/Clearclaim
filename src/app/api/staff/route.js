import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'

export const runtime = 'nodejs'

async function authenticateForGet(request, log) {
  const cookieClient = await createClient()
  const { data: { user }, error: authError } = await cookieClient.auth.getUser()
  if (authError || !user) throw AppError.unauthorized()

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.company_id) {
    throw AppError.forbidden('Complete onboarding first')
  }

  // If role is null, treat as admin (company creator)
  const effectiveRole = profile.role ?? 'admin'

  return {
    userId: user.id,
    companyId: profile.company_id,
    role: effectiveRole,
    userLog: log.child({ userId: user.id }),
  }
}

async function authenticateAsAdmin(request, log) {
  const cookieClient = await createClient()
  const { data: { user }, error: authError } = await cookieClient.auth.getUser()
  if (authError || !user) throw AppError.unauthorized()

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.company_id) {
    throw AppError.forbidden('Complete onboarding first')
  }

  // Company creators may not have role set yet — default to admin
  if (profile.role && profile.role !== 'admin') {
    throw AppError.forbidden('Only admins can manage staff')
  }

  // If role is null, this is likely the company creator — upgrade them
  if (!profile.role) {
    await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin', updated_at: new Date().toISOString() })
      .eq('id', user.id)
  }

  return {
    userId: user.id,
    companyId: profile.company_id,
    userLog: log.child({ userId: user.id }),
  }
}

/**
 * GET /api/staff
 *
 * Returns all staff for the authenticated admin's company.
 */
export async function GET(request) {
  const start = Date.now()
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'GET /api/staff' })

  try {
    const { companyId, role, userLog } = await authenticateForGet(request, log)

    const { data: staff, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, department, phone, status, avatar_url, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) {
      userLog.error({ err: error }, 'Failed to fetch staff')
      throw AppError.internal('Failed to load staff')
    }

    userLog.info({ count: staff.length, durationMs: Date.now() - start }, 'Staff listed')

    return NextResponse.json({
      currentUser: {
        id: userId,
        role,
      },
      staff: (staff ?? []).map((s) => ({
        id: s.id,
        email: s.email,
        name: s.full_name ?? s.email?.split('@')[0] ?? 'Unknown',
        role: s.role ?? 'staff',
        department: s.department ?? '',
        phone: s.phone ?? '',
        status: s.status ?? 'active',
        avatarUrl: s.avatar_url,
        joined: s.created_at,
      })),
    })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    log.error({ err, durationMs: Date.now() - start }, 'GET staff failed')
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Something went wrong' } },
      { status: 500 },
    )
  }
}

/**
 * POST /api/staff
 *
 * Invites a new staff member by email. The invitee receives a Supabase
 * magic-link email. On sign-up, the auth callback stores their profile
 * with the role, department, and company_id from user_metadata.
 *
 * Body: { email: string, role: string, department?: string, phone?: string }
 */
export async function POST(request) {
  const start = Date.now()
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'POST /api/staff' })

  try {
    const { companyId, userLog } = await authenticateAsAdmin(request, log)

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      throw AppError.badRequest('Request body must be valid JSON')
    }

    const { email, role, department, phone } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw AppError.badRequest('A valid email is required')
    }
    if (!role || !['admin', 'manager', 'staff'].includes(role)) {
      throw AppError.badRequest('Role must be one of: admin, manager, staff')
    }

    // Check if already invited
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .eq('company_id', companyId)
      .maybeSingle()

    if (existing) {
      throw AppError.badRequest('A staff member with this email already exists')
    }

    // Send Supabase invite with metadata
    const { data: inviteData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: {
          role,
          department: department ?? '',
          phone: phone ?? '',
          company_id: companyId,
          invited_by: userLog.fields?.userId,
        },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? request.headers.get('origin')}/dashboard`,
      })

    if (inviteError) {
      userLog.error({ err: inviteError, email }, 'Failed to send staff invite')
      if (inviteError.message?.includes('already')) {
        throw AppError.badRequest('This email is already registered')
      }
      throw AppError.internal('Failed to send invitation. Please try again.')
    }

    // Upsert profile record with 'invited' status so it appears in the staff list
    if (inviteData?.user?.id) {
      await supabaseAdmin.from('profiles').upsert(
        {
          id: inviteData.user.id,
          email,
          role,
          department: department ?? '',
          phone: phone ?? '',
          company_id: companyId,
          status: 'invited',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
    }

    userLog.info({ email, role, department }, 'Staff invited')

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
    })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    log.error({ err, durationMs: Date.now() - start }, 'POST staff failed')
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: err.message || 'Failed to invite staff' } },
      { status: err.status || 500 },
    )
  }
}
