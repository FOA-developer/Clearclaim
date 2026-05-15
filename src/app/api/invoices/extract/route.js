import { NextResponse } from 'next/server'
import { NoObjectGeneratedError } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'
import {
  extractPlainTextFromPdf,
  extractInvoiceWithModel,
} from '@/lib/services/invoicePdfExtraction'

export const runtime = 'nodejs'
export const maxDuration = 120

const MAX_BYTES = 6 * 1024 * 1024
const MIN_TEXT_CHARS = 40

function isAiGatewayConfigured() {
  const hasApiKey = Boolean(process.env.AI_GATEWAY_API_KEY?.trim())
  const onVercel = Boolean(process.env.VERCEL)
  return hasApiKey || onVercel
}

async function authenticate(request, log) {
  const cookieClient = await createClient()
  const {
    data: { user },
    error: authError,
  } = await cookieClient.auth.getUser()

  if (authError || !user) throw AppError.unauthorized()

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.company_id) {
    throw AppError.forbidden('Complete onboarding first')
  }

  return { userId: user.id, companyId: profile.company_id, userLog: log.child({ userId: user.id }) }
}

/**
 * POST /api/invoices/extract
 *
 * Accepts multipart PDF upload, extracts embedded text, and uses Vercel AI Gateway
 * (AI SDK `generateObject` + `creator/model-name`) for structured draft fields compatible with POST /api/invoices.
 *
 * Auth: Set `AI_GATEWAY_API_KEY` locally. On Vercel, OIDC can authenticate the gateway without a key
 * (`vercel dev` / `vercel env pull` for local OIDC).
 * Optional env: `AI_GATEWAY_INVOICE_MODEL` (default `openai/gpt-4o-mini`).
 */
export async function POST(request) {
  const start = Date.now()
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'POST /api/invoices/extract' })

  try {
    const { userId, userLog } = await authenticate(request, log)

    if (!isAiGatewayConfigured()) {
      throw AppError.serviceUnavailable(
        'Invoice AI extraction is not configured. Set AI_GATEWAY_API_KEY, run on Vercel with AI Gateway OIDC, or use `vercel dev` / `vercel env pull`.',
      )
    }

    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.includes('multipart/form-data')) {
      throw AppError.badRequest('Expected multipart/form-data')
    }

    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      throw AppError.badRequest('Missing file field')
    }
    if (file.size > MAX_BYTES) {
      throw AppError.badRequest('File too large (max 6 MB)')
    }
    if ((file.type && file.type !== 'application/pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      throw AppError.badRequest('Only PDF files are accepted')
    }

    const arrayBuffer = await file.arrayBuffer()
    const plainText = await extractPlainTextFromPdf(arrayBuffer)

    if (plainText.length < MIN_TEXT_CHARS) {
      throw AppError.badRequest(
        'Could not read enough text from this PDF. Use a searchable PDF or a text-based invoice; scanned images need separate OCR.',
      )
    }

    let suggestedCreateBody
    try {
      suggestedCreateBody = await extractInvoiceWithModel({
        documentText: plainText,
        fileName: file.name,
        userId,
      })
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        userLog.warn({ err }, 'AI produced no structured invoice object')
        throw AppError.badRequest(
          'The model could not extract a valid invoice from this document. Try a clearer PDF or add the invoice manually.',
        )
      }
      if (err instanceof z.ZodError) {
        userLog.warn({ issues: err.flatten() }, 'extracted invoice failed schema validation')
        throw AppError.badRequest('Extracted data did not pass validation', {
          issues: err.flatten().fieldErrors,
        })
      }
      throw err
    }

    userLog.info(
      { fileName: file.name, chars: plainText.length, durationMs: Date.now() - start },
      'invoice PDF AI extract success',
    )

    return NextResponse.json({
      message: 'Extraction complete',
      suggestedCreateBody,
      fileName: file.name,
      source: 'ai_pdf_text',
    })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode })
    }
    log.error({ err, durationMs: Date.now() - start }, 'extract endpoint failed')
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Something went wrong' } },
      { status: 500 },
    )
  }
}
