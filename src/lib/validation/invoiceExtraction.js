import { z } from 'zod'

/**
 * Schema for LLM extraction from invoice PDF text.
 * Mirrors POST /api/invoices body; validated again with createInvoiceSchema before returning.
 *
 * JSON Schema strict mode (Vercel AI Gateway / OpenAI structured output) requires every key
 * listed under `properties` to appear in `required`. Optional nested fields must use
 * defaults instead of `.optional()` so the converted schema stays valid.
 */

const extractAddressSchema = z.object({
  street: z.string().describe('Street line').default(''),
  city: z.string().default(''),
  state: z.string().default(''),
  country: z.string().describe('Usually Nigeria').default(''),
  postalCode: z.string().default(''),
})

const extractContactSchema = z.object({
  email: z.string().default(''),
  phone: z.string().default(''),
})

const extractBuyerSchema = z.object({
  type: z.enum(['business', 'individual']).default('business'),
  businessName: z
    .string()
    .describe('Bill-to / customer / buyer name (organization or person being invoiced)'),
  contactPerson: z.string().default(''),
  tin: z.string().describe('Tax Identification Number if shown').default(''),
  address: extractAddressSchema,
  contact: extractContactSchema,
})

const extractItemSchema = z.object({
  description: z.string().describe('Line item description'),
  quantity: z.number().positive().describe('Quantity'),
  unit: z.string().describe('Unit of measure').default('unit'),
  unitPrice: z
    .number()
    .nonnegative()
    .describe('Unit price in major currency units (e.g. naira), not kobo'),
  vatApplicable: z.boolean().default(true),
  vatRate: z.number().default(7.5),
})

export const invoiceAiExtractSchema = z.object({
  invoiceDate: z.string().describe('Invoice date strictly as YYYY-MM-DD'),
  dueDate: z.string().describe('Due / payment deadline as YYYY-MM-DD'),
  currency: z.string().default('NGN'),
  purchaseOrderNumber: z.string().default('').describe('PO number if present'),
  buyer: extractBuyerSchema,
  items: z
    .array(extractItemSchema)
    .min(1)
    .max(40)
    .describe('All invoice line rows with numeric amounts'),
  paymentTerms: z.string().default('').describe('Payment terms verbatim or summarized'),
  discount: z.number().nonnegative().default(0),
  withholdingTaxRate: z.number().nonnegative().max(100).default(0),
  requiresSignature: z.boolean().default(false),
  signedBy: z.string().default(''),
  acceptedMethods: z.array(z.string()).default([]),
})
