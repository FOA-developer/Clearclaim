import { z } from 'zod'

/**
 * Schema for LLM extraction from invoice PDF text.
 * Mirrors POST /api/invoices body; validated again with createInvoiceSchema before returning.
 *
 * OpenAI strict structured output (via Vercel AI Gateway / response_format.json_schema)
 * requires every key listed under `properties` to appear in `required` — at ALL nesting levels.
 * Therefore no .default() or .optional() is used anywhere in this schema; every field is required.
 * The system prompt instructs the model to use empty/zero/false values for missing data.
 */

const extractAddressSchema = z.object({
  street: z.string().describe('Street line'),
  city: z.string(),
  state: z.string(),
  country: z.string().describe('Usually Nigeria'),
  postalCode: z.string(),
})

const extractContactSchema = z.object({
  email: z.string(),
  phone: z.string(),
})

const extractBuyerSchema = z.object({
  type: z.enum(['business', 'individual']).describe('Buyer type'),
  businessName: z
    .string()
    .describe('Bill-to / customer / buyer name (organization or person being invoiced)'),
  contactPerson: z.string().describe('Contact person name'),
  tin: z.string().describe('Tax Identification Number if shown'),
  address: extractAddressSchema,
  contact: extractContactSchema,
})

const extractItemSchema = z.object({
  description: z.string().describe('Line item description'),
  quantity: z.number().positive().describe('Quantity'),
  unit: z.string().describe('Unit of measure'),
  unitPrice: z
    .number()
    .nonnegative()
    .describe('Unit price in major currency units (e.g. naira), not kobo'),
  vatApplicable: z.boolean().describe('Whether VAT applies to this line item'),
  vatRate: z.number().describe('VAT rate percentage (e.g. 7.5)'),
})

export const invoiceAiExtractSchema = z.object({
  invoiceDate: z.string().describe('Invoice date strictly as YYYY-MM-DD'),
  dueDate: z.string().describe('Due / payment deadline as YYYY-MM-DD'),
  currency: z.string().describe('Currency code, e.g. NGN'),
  purchaseOrderNumber: z.string().describe('PO number if present, otherwise empty string'),
  buyer: extractBuyerSchema,
  items: z
    .array(extractItemSchema)
    .min(1)
    .max(40)
    .describe('All invoice line rows with numeric amounts'),
  paymentTerms: z.string().describe('Payment terms verbatim, or empty string'),
  discount: z.number().nonnegative().describe('Total discount in major currency units, 0 if none'),
  withholdingTaxRate: z.number().nonnegative().max(100).describe('Withholding tax rate percentage, 0 if none'),
  requiresSignature: z.boolean().describe('Whether the invoice requires a signature'),
  signedBy: z.string().describe('Name of signatory, or empty string'),
  acceptedMethods: z.array(z.string()).describe('Accepted payment methods, empty array if none'),
})
