import { z } from 'zod'

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

const COMPANY_REVENUES = [
  'Under ₦10M',
  '₦10M - ₦50M',
  '₦50M - ₦200M',
  '₦200M - ₦1B',
  '₦1B - ₦5B',
  'Above ₦5B',
]

const SIGNER_ROLES = [
  'owner',
  'ceo',
  'cto',
  'cfo',
  'hr_manager',
  'finance_manager',
  'operations_manager',
  'other',
]

/**
 * POST /api/auth/onboarding — company profile completion.
 * Called after signup, requires an authenticated session.
 */
export const onboardingSchema = z
  .object({
    ownerName: z
      .string({ required_error: 'Owner name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be 100 characters or fewer')
      .transform((v) => v.trim()),

    companyName: z
      .string({ required_error: 'Company name is required' })
      .min(2, 'Company name must be at least 2 characters')
      .max(200, 'Company name must be 200 characters or fewer')
      .transform((v) => v.trim()),

    companySize: z.enum(COMPANY_SIZES, {
      required_error: 'Company size is required',
      invalid_type_error: `Company size must be one of: ${COMPANY_SIZES.join(', ')}`,
    }),

    companyRevenue: z.enum(COMPANY_REVENUES, {
      required_error: 'Company revenue is required',
      invalid_type_error: `Company revenue must be one of: ${COMPANY_REVENUES.join(', ')}`,
    }),

    signerRole: z.enum(SIGNER_ROLES, {
      required_error: 'Signer role is required',
      invalid_type_error: `Signer role must be one of: ${SIGNER_ROLES.join(', ')}`,
    }),
  })
  .strict()

export { COMPANY_SIZES, COMPANY_REVENUES, SIGNER_ROLES }
