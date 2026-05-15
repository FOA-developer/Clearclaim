import { z } from 'zod'

const addressSchema = z.object({
  street: z.string().max(200).optional().default(''),
  city: z.string().max(100).optional().default(''),
  state: z.string().max(100).optional().default(''),
  country: z.string().max(100).optional().default('Nigeria'),
  postalCode: z.string().max(20).optional().default(''),
})

const buyerSchema = z.object({
  type: z.enum(['business', 'individual']).default('business'),
  businessName: z.string().min(1, 'Buyer name is required').max(200),
  contactPerson: z.string().max(100).optional().default(''),
  tin: z.string().max(30).optional().default(''),
  address: addressSchema.optional().default({}),
  contact: z
    .object({
      email: z
        .string()
        .max(255)
        .default('')
        .refine((s) => !s.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()), {
          message: 'Invalid buyer email',
        }),
      phone: z.string().max(20).optional().default(''),
    })
    .optional()
    .default({}),
})

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Item description is required').max(300),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().max(30).optional().default('unit'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  vatApplicable: z.boolean().optional().default(true),
  vatRate: z.number().min(0).max(100).optional().default(7.5),
})

export const createInvoiceSchema = z
  .object({
    invoiceDate: z.string().min(1, 'Invoice date is required'),
    dueDate: z.string().min(1, 'Due date is required'),
    currency: z.string().max(5).optional().default('NGN'),
    purchaseOrderNumber: z.string().max(50).optional().default(''),
    buyer: buyerSchema,
    items: z
      .array(invoiceItemSchema)
      .min(1, 'At least one line item is required')
      .max(50, 'Maximum 50 line items'),
    paymentTerms: z.string().max(200).optional().default('Payment due within 7 days'),
    acceptedMethods: z.array(z.string()).optional().default(['bank_transfer']),
    requiresSignature: z.boolean().optional().default(false),
    signedBy: z.string().max(100).optional().default(''),
    discount: z.number().min(0).optional().default(0),
    withholdingTaxRate: z.number().min(0).max(100).optional().default(0),
    initialStatus: z.enum(['draft', 'pending']).optional().default('pending'),
  })
  .strict()

export const updateInvoiceSchema = z
  .object({
    status: z.enum(['draft', 'pending', 'approved', 'rejected', 'paid']).optional(),
    dueDate: z.string().optional(),
    invoiceDate: z.string().optional(),
    currency: z.string().max(5).optional(),
    purchaseOrderNumber: z.string().max(50).optional(),
    buyer: buyerSchema.optional(),
    items: z.array(invoiceItemSchema).min(1).max(50).optional(),
    paymentTerms: z.string().max(200).optional(),
    acceptedMethods: z.array(z.string()).optional(),
    discount: z.number().min(0).optional(),
    withholdingTaxRate: z.number().min(0).max(100).optional(),
    requiresSignature: z.boolean().optional(),
    signedBy: z.string().max(100).optional(),
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, { message: 'At least one field is required' })
