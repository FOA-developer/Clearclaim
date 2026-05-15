import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import logger from '@/lib/logger'

/**
 * Creates a cookie-aware Supabase client for Route Handlers.
 *
 * This client reads/writes httpOnly session cookies so the browser
 * maintains a Supabase Auth session across requests. It uses the
 * publishable key — cookie management is its ONLY job.
 *
 * For database operations and admin auth, use the admin client instead.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            try {
              cookieStore.set(name, value, options)
            } catch (error) {
              logger.error(
                { err: error, cookieName: name },
                'failed to set auth cookie in route handler — session may not persist',
              )
            }
          }
        },
      },
    },
  )
}
