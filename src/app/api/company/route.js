import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'
import { companyPatchSchema } from '@/lib/validation/company'

async function requireCompany(request, log) {
  const cookieClient = await createClient()
  const {
    data: { user },
    error: authError,
  } = await cookieClient.auth.getUser()

  if (authError || !user) throw AppError.unauthorized()

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (error || !profile?.company_id) throw AppError.forbidden('Complete onboarding first')

  return {
    userId: user.id,
    companyId: profile.company_id,
    userLog: log.child({ userId: user.id }),
  }
}

function mapRow(row) {
  if (!row) return null
  return {
    id: row.id,
    companyName: row.name,
    industry: row.industry ?? '',
    size: row.size ?? '',
    revenue: row.revenue ?? '',
    cacNumber: row.cac_number ?? '',
    tin: row.tin ?? '',
    vatNumber: row.vat_number ?? '',
    address: row.address ?? {},
    contact: row.contact ?? {},
    bankDetails: row.bank_details ?? {},
  }
}

/**
 * GET /api/company
 */
export async function GET(request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'GET /api/company' })

  try {
    const { companyId, userLog } = await requireCompany(request, log)

    const { data, error } = await supabaseAdmin
      .from('companies')
      .select(
        'id, name, industry, size, revenue, cac_number, tin, vat_number, address, contact, bank_details',
      )
      .eq('id', companyId)
      .single()

    if (error || !data) {
      userLog.warn({ err: error }, 'company load failed')
      throw AppError.notFound('Company not found')
    }

    return NextResponse.json({ company: mapRow(data) })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    log.error({ err }, 'GET /api/company failed')
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Something went wrong' } },
      { status: 500 },
    )
  }
}

/**
 * PATCH /api/company
 */
export async function PATCH(request) {
  const start = Date.now()
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'PATCH /api/company' })

  try {
    const { companyId, userLog } = await requireCompany(request, log)

    const body = await request.json().catch(() => null)
    if (!body) throw AppError.badRequest('Request body must be valid JSON')

    const parsed = companyPatchSchema.safeParse(body)
    if (!parsed.success) {
      throw AppError.badRequest('Validation failed', {
        issues: parsed.error.flatten().fieldErrors,
      })
    }

    const p = parsed.data

    /** @type {Record<string, unknown>} */
    const patch = {}

    if (p.name !== undefined) patch.name = p.name
    if (p.industry !== undefined) patch.industry = p.industry
    if (p.size !== undefined) patch.size = p.size
    if (p.revenue !== undefined) patch.revenue = p.revenue
    if (p.cacNumber !== undefined) patch.cac_number = p.cacNumber
    if (p.tin !== undefined) patch.tin = p.tin
    if (p.vatNumber !== undefined) patch.vat_number = p.vatNumber
    if (p.address !== undefined) patch.address = p.address
    if (p.contact !== undefined) patch.contact = p.contact
    if (p.bankDetails !== undefined) patch.bank_details = p.bankDetails

    if (Object.keys(patch).length === 0) {
      throw AppError.badRequest('No fields to update')
    }

    const { data, error } = await supabaseAdmin
      .from('companies')
      .update(patch)
      .eq('id', companyId)
      .select(
        'id, name, industry, size, revenue, cac_number, tin, vat_number, address, contact, bank_details',
      )
      .single()

    if (error) {
      userLog.error({ err: error }, 'company update failed')
      throw AppError.internal('Could not update company')
    }

    userLog.info({ durationMs: Date.now() - start }, 'company updated')

    return NextResponse.json({ company: mapRow(data) })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    log.error({ err, durationMs: Date.now() - start }, 'PATCH /api/company failed')
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Something went wrong' } },
      { status: 500 },
    )
  }
}
