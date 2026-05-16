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
    errors.push(`Row ${index + 2}: Missing staff name (full_name or name column)`)
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

/**
 * POST /api/staff/csv
 *
 * Bulk upload staff via CSV file. Accepts multipart/form-data with a 'file' field.
 * Expected CSV columns: full_name or name (required), email, role, department, phone,
 * account_name, account_number, bank_name, bank_code. No invitation emails.
 *
 * Returns a summary of successes and failures.
 */
export async function POST(request) {
  const start = Date.now()
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'POST /api/staff/csv' })

  try {
    // Authenticate as admin
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

    if (profile.role !== 'admin') {
      await supabaseAdmin
        .from('profiles')
        .update({ role: 'admin', updated_at: new Date().toISOString() })
        .eq('id', user.id)
    }

    const companyId = profile.company_id
    const userLog = log.child({ userId: user.id })

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      throw AppError.badRequest('CSV file is required')
    }

    const text = await file.text()
    const { rows } = parseCsv(text)

    if (rows.length === 0) {
      throw AppError.badRequest('CSV file is empty or has no data rows')
    }

    const results = { succeeded: [], failed: [] }
    const redirectBase =
      (request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(
        /\/$/,
        '',
      ) || ''

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const validation = validateCsvRow(row, i)

      if (!validation.valid) {
        results.failed.push({ row: i + 2, email: row.email ?? '', errors: validation.errors })
        continue
      }

      const {
        email,
        fullName,
        role,
        department,
        phone,
        accountName,
        accountNumber,
        bankName,
        bankCode,
      } = validation.data

      try {
        // Check if already exists
        const { data: existing } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', email)
          .eq('company_id', companyId)
          .maybeSingle()

        if (existing) {
          results.failed.push({ row: i + 2, email, errors: ['Already exists in this company'] })
          continue
        }

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
          actingUserId: user.id,
          redirectTo: redirectBase ? `${redirectBase}/dashboard` : undefined,
          generateMagicLink: false,
        })

        if (!result.ok) {
          results.failed.push({
            row: i + 2,
            email,
            errors: [result.error?.message ?? 'Failed to create staff'],
          })
          continue
        }

        results.succeeded.push({ row: i + 2, email, name: fullName })
      } catch (err) {
        results.failed.push({ row: i + 2, email, errors: [err.message ?? 'Unexpected error'] })
      }
    }

    userLog.info(
      { succeeded: results.succeeded.length, failed: results.failed.length, durationMs: Date.now() - start },
      'CSV staff import completed',
    )

    return NextResponse.json({
      success: true,
      total: rows.length,
      succeeded: results.succeeded.length,
      failed: results.failed.length,
      details: results,
    })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    log.error({ err, durationMs: Date.now() - start }, 'CSV staff import failed')
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: err.message || 'CSV upload failed' } },
      { status: 500 },
    )
  }
}
