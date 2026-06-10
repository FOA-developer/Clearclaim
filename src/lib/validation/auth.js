import { z } from 'zod'

export const loginSchema = z
  .object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format')
      .max(255, 'Email must be 255 characters or fewer')
      .transform((v) => v.toLowerCase().trim()),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be 128 characters or fewer'),
  })
  .strict()

/**
 * Validates input against a Zod schema.
 * Returns { data } on success or { error } on failure.
 * @template T
 * @param {z.ZodSchema<T>} schema
 * @param {unknown} input
 * @returns {{ data: T, error: null } | { data: null, error: z.ZodError }}
 */
export function validate(schema, input) {
  const result = schema.safeParse(input)
  if (result.success) {
    return { data: result.data, error: null }
  }
  return { data: null, error: result.error }
}

/**
 * Formats Zod errors into a client-friendly object.
 * @param {z.ZodError} zodError
 */
export function formatValidationErrors(zodError) {
  const fields = {}
  for (const issue of zodError.issues) {
    const path = issue.path.join('.')
    if (!fields[path]) {
      fields[path] = issue.message
    }
  }
  return {
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
      fields,
    },
  }
}
