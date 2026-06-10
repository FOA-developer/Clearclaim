import { z } from 'zod'

const addressSchema = z
  .object({
    street: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
  })
  .strict()
  .optional()

const contactSchema = z
  .object({
    email: z
      .string()
      .max(255)
      .optional()
      .refine((s) => !s || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s), { message: 'Invalid email' }),
    phone: z.string().max(30).optional(),
    website: z.string().max(500).optional(),
  })
  .strict()
  .optional()

const bankDetailsSchema = z
  .object({
    bankName: z.string().max(120).optional(),
    accountName: z.string().max(200).optional(),
    accountNumber: z.string().max(30).optional(),
  })
  .strict()
  .optional()

export const companyPatchSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    industry: z.string().max(120).optional(),
    size: z.string().max(50).optional(),
    revenue: z.string().max(50).optional(),
    cacNumber: z.string().max(30).optional(),
    tin: z.string().max(40).optional(),
    vatNumber: z.string().max(40).optional(),
    address: addressSchema,
    contact: contactSchema,
    bankDetails: bankDetailsSchema,
  })
  .strict()
