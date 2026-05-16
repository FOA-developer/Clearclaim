import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'

export const runtime = 'nodejs'

const ALLOWED_STATUSES = ['active', 'suspended', 'terminated', 'on_leave']
const ALLOWED_ROLES = ['admin', 'manager', 'staff']

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
 * PATCH /api/staff/[id]
 *
 * Updates a staff member's status (suspend, terminate, reactivate) or role.
 * Only admins can call this. You cannot modify your own status.
 *
 * Body: { status?: string, role?: string, department?: string, phone?: string }
 */
export async function PATCH(request, { params: paramsPromise }) {
  const params = await paramsPromise
  const start = Date.now()
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'PATCH /api/staff/[id]' })

  try {
    const { userId, companyId, userLog } = await authenticateAsAdmin(request, log)
    const targetId = params.id

    // Prevent self-modification
    if (targetId === userId) {
      throw AppError.badRequest('You cannot modify your own status')
    }

    // Verify target belongs to same company
    const { data: target, error: fetchErr } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, status, department, phone')
      .eq('id', targetId)
      .eq('company_id', companyId)
      .single()

    if (fetchErr?.code === 'PGRST116' || !target) {
      throw AppError.notFound('Staff member not found')
    }
    if (fetchErr) {
      userLog.error({ err: fetchErr }, 'Failed to fetch staff')
      throw AppError.internal('Failed to load staff member')
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      throw AppError.badRequest('Request body must be valid JSON')
    }

    const { status, role, department, phone } = body
    const updates = {}

    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        throw AppError.badRequest(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`)
      }
      updates.status = status
    }

    if (role !== undefined) {
      if (!ALLOWED_ROLES.includes(role)) {
        throw AppError.badRequest(`Role must be one of: ${ALLOWED_ROLES.join(', ')}`)
      }
      updates.role = role
    }

    if (department !== undefined) {
      updates.department = typeof department === 'string' ? department : ''
    }

    if (phone !== undefined) {
      updates.phone = typeof phone === 'string' ? phone : ''
    }

    if (Object.keys(updates).length === 0) {
      throw AppError.badRequest('No valid fields to update')
    }

    updates.updated_at = new Date().toISOString()

    const { error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', targetId)

    if (updateErr) {
      userLog.error({ err: updateErr }, 'Failed to update staff')
      throw AppError.internal('Failed to update staff member')
    }

    userLog.info(
      { targetId, updates, durationMs: Date.now() - start },
      'Staff updated',
    )

    return NextResponse.json({
      success: true,
      staff: {
        id: target.id,
        email: target.email,
        name: target.full_name ?? target.email?.split('@')[0] ?? 'Unknown',
        role: updates.role ?? target.role,
        department: updates.department ?? target.department,
        phone: updates.phone ?? target.phone,
        status: updates.status ?? target.status,
      },
    })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    log.error({ err, durationMs: Date.now() - start }, 'PATCH staff failed')
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Something went wrong' } },
      { status: 500 },
    )
  }
}
