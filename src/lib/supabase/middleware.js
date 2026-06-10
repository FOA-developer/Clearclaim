import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

/**
 * Creates a Supabase client scoped to middleware.
 * Refreshes expired auth sessions on every request by rewriting cookies
 * into the forwarded request + outgoing response.
 *
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<{ supabase: import('@supabase/supabase-js').SupabaseClient, response: NextResponse }>}
 */
export async function createMiddlewareClient(request) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  return { supabase, response }
}
