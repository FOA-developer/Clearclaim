import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'
import { canManageCompanyStaff } from '@/lib/staff/staffAccess'

export const runtime = 'nodejs'

const ALLOWED_STATUSES = ['active', 'suspended', 'terminated', 'on_leave']
const ALLOWED_ROLES = ['admin', 'manager', 'staff']

/**
 * Retry a Supabase admin operation on socket/network errors.
 * Uses exponential backoff: 600ms, 1200ms, 2400ms.
 */
async function withRetry(operation, label, log) {
  const MAX_ATTEMPTS = 3
  let lastErr = null
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await operation()
    } catch (err) {
      lastErr = err
      const isFetchFailure =
        err instanceof TypeError &&
        (err.message === 'fetch failed' || err.cause?.message?.includes('UND_ERR_SOCKET'))

      if (isFetchFailure && attempt < MAX_ATTEMPTS) {
        const delayMs = 600 * Math.pow(2, attempt - 1)
        log.warn(
          { attempt, delayMs, err: err.message },
          `Supabase ${label} fetch failed, retrying`,
        )
        await new Promise((resolve) => setTimeout(resolve, delayMs))
        continue
      }
      break
    }
  }
  throw lastErr
}

async function authenticateAsAdmin(request, log) {
  const cookieClient = await createClient()
  const { data: { user }, error: authError } = await cookieClient.auth.getUser()
  if (authError || !user) throw AppError.unauthorized()

  const { data: profile, error: profileError } = await withRetry(
    () =>
      supabaseAdmin
        .from('profiles')
        .select('company_id, role')
        .eq('id', user.id)
        .single(),
    'auth profile lookup',
    log,
  )

  if (profileError || !profile?.company_id) {
    throw AppError.forbidden('Complete onboarding first')
  }

  const allowed = await canManageCompanyStaff(user.id, profile.company_id, profile.role)
  if (!allowed) {
    throw AppError.forbidden('Only admins can manage staff')
  }

  if (profile.role !== 'admin') {
    await withRetry(
      () =>
        supabaseAdmin
          .from('profiles')
          .update({ role: 'admin', updated_at: new Date().toISOString() })
          .eq('id', user.id),
      'normalize admin role',
      log,
    )
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
 * Updates a staff member's status (suspend, terminate, reactivate), role,
 * department, phone, and bank account details.
 * Only admins can call this. You cannot modify your own status.
 *
 * Body: {
 *   status?: string,
 *   role?: string,
 *   department?: string,
 *   phone?: string,
 *   accountName?: string,
 *   accountNumber?: string,
 *   bankName?: string,
 *   bankCode?: string,
 * }
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
    const { data: target, error: fetchErr } = await withRetry(
      () =>
        supabaseAdmin
          .from('profiles')
          .select('id, email, full_name, role, phone_number')
          .eq('id', targetId)
          .eq('company_id', companyId)
          .single(),
      'target staff lookup',
      userLog,
    )

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

    const { status, role, department, phone, accountName, accountNumber, bankName, bankCode } = body
    const updates = {}

    if (status !== undefined && ALLOWED_STATUSES.includes(status)) {
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
      updates.phone_number = typeof phone === 'string' ? phone : ''
    }

    if (accountName !== undefined) {
      updates.account_name = typeof accountName === 'string' ? accountName : ''
    }

    if (accountNumber !== undefined) {
      updates.account_number = typeof accountNumber === 'string' ? accountNumber : ''
    }

    if (bankName !== undefined) {
      updates.bank_name = typeof bankName === 'string' ? bankName : ''
    }

    if (bankCode !== undefined) {
      updates.bank_code = typeof bankCode === 'string' ? bankCode : ''
    }

    if (Object.keys(updates).length === 0) {
      throw AppError.badRequest('No valid fields to update')
    }

    updates.updated_at = new Date().toISOString()

    const { error: updateErr } = await withRetry(
      () =>
        supabaseAdmin
          .from('profiles')
          .update(updates)
          .eq('id', targetId),
      'staff profile update',
      userLog,
    )

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
        role: updates.role ?? target.role ?? 'staff',
        department: updates.department ?? target.department ?? '',
        phone: updates.phone_number ?? target.phone_number ?? '',
        status: updates.status ?? target.status ?? 'active',
        accountName: updates.account_name ?? target.account_name ?? '',
        accountNumber: updates.account_number ?? target.account_number ?? '',
        bankName: updates.bank_name ?? target.bank_name ?? '',
        bankCode: updates.bank_code ?? target.bank_code ?? '',
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
