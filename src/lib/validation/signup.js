import { z } from 'zod'

/**
 * POST /api/auth/signup — account creation only.
 * Captures email and password.
 * Name and company details are collected in the onboarding step.
 */
export const signupSchema = z
  .object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format')
      .max(255, 'Email must be 255 characters or fewer')
      .transform((v) => v.toLowerCase().trim()),

    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be 128 characters or fewer')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),
  })
  .strict()
