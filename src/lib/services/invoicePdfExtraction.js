import { generateObject, createGateway } from 'ai'
import { PDFParse } from 'pdf-parse'
import { invoiceAiExtractSchema } from '@/lib/validation/invoiceExtraction'

const DEFAULT_GATEWAY_MODEL = 'openai/gpt-4o-mini'

/**
 * Parsed invoice extraction result aligned with invoiceAiExtractSchema.
 * @typedef {import('zod').infer<typeof invoiceAiExtractSchema>} InvoiceExtractedDraft
 */

const gatewayProvider = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? '',
})

/**
 * Extract embedded/selectable PDF text via pdf-parse.
 *
 * @param {ArrayBuffer} arrayBuffer Raw PDF bytes
 * @returns {Promise<string>} Concatenated document text
 */
export async function extractPlainTextFromPdf(arrayBuffer) {
  const parser = new PDFParse({ data: new Uint8Array(arrayBuffer) })
  try {
    const result = await parser.getText()
    return typeof result?.text === 'string' ? result.text : ''
  } finally {
    await parser.destroy()
  }
}

/**
 * Normalize raw PDF text before sending to the model (cheap wins for scanned mixed layouts).
 *
 * @param {string} text
 */
function preprocessPdfText(text) {
  if (!text) return ''
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
}

/**
 * Use Vercel AI Gateway (creator/model-name) to infer structured invoice draft fields from extracted PDF text.
 *
 * Requires `AI_GATEWAY_API_KEY` locally, or Vercel OIDC when deployed to Vercel without a key (see AI Gateway docs).
 * Model defaults to AI_GATEWAY_INVOICE_MODEL or openai/gpt-4o-mini.
 *
 * @param {object} params
 * @param {string} [params.pdfText]
 * @param {string} [params.documentText] Alias of pdfText (route compatibility)
 * @param {string} params.fileName Original file name (for tracing)
 * @param {string|null} params.userId Optional auth user ID for Gateway usage tagging
 * @returns {Promise<InvoiceExtractedDraft>}
 */
export async function extractInvoiceWithModel({
  pdfText,
  documentText,
  fileName,
  userId = null,
}) {
  const sourceText =
    pdfText ?? documentText ?? ''
  const modelIdEnv = (
    process.env.AI_GATEWAY_INVOICE_MODEL ||
    DEFAULT_GATEWAY_MODEL
  ).trim()
  const modelId =
    modelIdEnv.length > 0 ? modelIdEnv : DEFAULT_GATEWAY_MODEL

  const cleaned = preprocessPdfText(sourceText).trim()

  if (!cleaned) {
    const err = new Error('Invoice PDF extraction failed: extracted text empty')
    err.code = 'INVOICE_PDF_PARSE_FAILED'
    throw err
  }

  const clipped = cleaned.length > 25_000 ? `${cleaned.slice(0, 25_000)}\n...[truncated]` : cleaned

  const { object } = await generateObject({
    model: gatewayProvider(modelId),
    schema: invoiceAiExtractSchema,
    temperature: 0,
    experimental_telemetry: { isEnabled: false },
    providerOptions: {
      gateway: {
        tags: ['feature:invoice-extract'],
        ...(userId ? { user: userId } : {}),
      },
    },
    system: `
Extract structured invoice data for Clear Claim (NGN B2B) from the raw PDF text only.

Rules:
1) Do not invent invoiceDate, dueDate, buyer, or line items — every value must be justified by the supplied text. If a field is missing and optional, omit or use schema defaults; required fields need the best faithful reading from the document.
2) Dates must be normalized to YYYY-MM-DD when you can infer them; if the document only shows an ambiguous date and you cannot resolve it, approximate only when the text clearly implies a single calendar date.
3) Output 1–40 items in the "items" array. Each item: description, quantity as a positive number (default 1 if implied), unitPrice in major currency units (not kobo). Derive unitPrice from line totals and quantity when shown.
4) buyer.businessName is the bill-to / customer name from the document (required). Map type to business vs individual from context.
5) purchaseOrderNumber should be empty string if no PO appears.
6) No prose or commentary — conform exactly to the structured output schema.
`.trim(),
    prompt: `FILE: ${fileName || 'invoice.pdf'}

EXTRACTED_INVOICE_TEXT:
"""${clipped}"""
`,
  })

  return object
}
