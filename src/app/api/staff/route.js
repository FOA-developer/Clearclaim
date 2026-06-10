import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'
import { canManageCompanyStaff } from '@/lib/staff/staffAccess'
import { provisionStaffWithoutEmail } from '@/lib/staff/provisionStaffWithoutEmail'

export const runtime = 'nodejs'

const ALLOWED_ROLES = ['admin', 'manager', 'staff']

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return { headers: [], rows: [] }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'))
  const rows = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    const obj = {}
    headers.forEach((h, i) => {
      obj[h] = values[i] ?? ''
    })
    return obj
  })
  return { headers, rows }
}

function validateCsvRow(row, index) {
  const errors = []
  const email = row.email ?? row.email_address ?? ''
  if (!email || !email.includes('@')) {
    errors.push(`Row ${index + 2}: Missing or invalid email`)
  }

  const fullNameRaw = row.full_name ?? row.name ?? row.staff_name ?? ''
  const fullName = String(fullNameRaw).trim()
  if (!fullName) {
    errors.push(`Row ${index + 2}: Missing staff name (use full_name or name column)`)
  }

  let role = (row.role ?? 'staff').toLowerCase()
  if (!ALLOWED_ROLES.includes(role)) {
    role = 'staff'
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      email: email.toLowerCase().trim(),
      fullName,
      role,
      department: row.department ?? '',
      phone: row.phone ?? row.phone_number ?? '',
      accountName: row.account_name ?? row.accountname ?? '',
      accountNumber: row.account_number ?? row.accountnumber ?? '',
      bankName: row.bank_name ?? row.bankname ?? '',
      bankCode: row.bank_code ?? row.bankcode ?? '',
    },
  }
}

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

  return {
    userId: user.id,
    companyId: profile.company_id,
    profileRole: profile.role,
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

  const allowed = await canManageCompanyStaff(user.id, profile.company_id, profile.role)
  if (!allowed) {
    throw AppError.forbidden('Only admins can manage staff')
  }

  // Normalize org owner / legacy rows to explicit admin role
  if (profile.role !== 'admin') {
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
    const { userId, companyId, profileRole, userLog } = await authenticateForGet(request, log)
    const canManageStaff = await canManageCompanyStaff(userId, companyId, profileRole)

    const { data: staff, error } = await supabaseAdmin
      .from('profiles')
      .select(
        'id, email, full_name, role, phone_number, avatar_url, created_at, department, status, account_name, account_number, bank_name, bank_code',
      )
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
        role: profileRole ?? 'staff',
        canManageStaff,
      },
      staff: (staff ?? []).map((s) => ({
        id: s.id,
        email: s.email,
        name: s.full_name ?? s.email?.split('@')[0] ?? 'Unknown',
        role: s.role ?? 'staff',
        department: s.department ?? '',
        phone: s.phone_number ?? '',
        status: s.status ?? 'active',
        avatarUrl: s.avatar_url,
        joined: s.created_at,
        accountName: s.account_name ?? '',
        accountNumber: s.account_number ?? '',
        bankName: s.bank_name ?? '',
        bankCode: s.bank_code ?? '',
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
 * Creates a confirmed Auth user — no invitation email — and upserts matching profile row.
 *
 * Body: {
 *   fullName?: string,
 *   name?: string,
 *   email: string,
 *   role: string,
 *   department?: string,
 *   phone?: string,
 *   accountName?, accountNumber?, bankName?, bankCode?
 * }
 */
export async function POST(request) {
  const start = Date.now()
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'POST /api/staff' })

  try {
    const { companyId, userId, userLog } = await authenticateAsAdmin(request, log)

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      throw AppError.badRequest('Request body must be valid JSON')
    }

    const {
      email,
      fullName: rawFullName,
      name,
      role,
      department,
      phone,
      accountName,
      accountNumber,
      bankName,
      bankCode,
    } = body

    const fullName = typeof rawFullName === 'string' && rawFullName.trim()
      ? rawFullName.trim()
      : typeof name === 'string' && name.trim()
        ? name.trim()
        : ''

    if (!fullName) {
      throw AppError.badRequest('Staff full name is required')
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw AppError.badRequest('A valid email is required')
    }
    if (!role || !ALLOWED_ROLES.includes(role)) {
      throw AppError.badRequest('Role must be one of: admin, manager, staff')
    }

    const normalizedEmail = email.trim().toLowerCase()

    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .eq('company_id', companyId)
      .maybeSingle()

    if (existing) {
      throw AppError.badRequest('A staff member with this email already exists')
    }

    const redirectBase =
      (process.env.NEXT_PUBLIC_SITE_URL ?? request.headers.get('origin') ?? '').replace(/\/$/, '') ||
      ''

    const result = await provisionStaffWithoutEmail({
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
      actingUserId: userId,
      redirectTo: redirectBase ? `${redirectBase}/dashboard` : undefined,
      generateMagicLink: false,
    })

    if (!result.ok) {
      userLog.warn({ err: result.error }, 'Staff provision failed')
      if (result.error?.kind === 'CONFLICT') {
        throw AppError.conflict(result.error.message ?? 'Email already registered')
      }
      if (result.error?.kind === 'VALIDATION') {
        throw AppError.badRequest(result.error.message ?? 'Validation failed')
      }
      throw AppError.internal(result.error?.message ?? 'Failed to create staff member')
    }

    userLog.info({ email: normalizedEmail, fullName }, 'Staff created without invite email')

    return NextResponse.json({
      success: true,
      message: `${fullName} was added — no invitation email was sent.`,
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

