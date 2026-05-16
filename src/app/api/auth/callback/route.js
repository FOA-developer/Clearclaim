import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { createRequestLogger } from '@/lib/logger'

/**
 * GET /api/auth/callback
 *
 * Handles OAuth / magic-link redirects from Supabase Auth.
 * 1. Exchanges the temporary `code` for a persistent session (cookie client).
 * 2. Upserts the user profile in the DB (admin client, service role).
 * 3. Redirects to /dashboard (or the `next` query param).
 */
export async function GET(request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'GET /api/auth/callback' })

  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    log.warn('auth callback received without code param')
    return NextResponse.redirect(new URL('/login?error=missing_code', origin))
  }

  try {
    const cookieClient = await createClient()
    const { data, error: exchangeError } = await cookieClient.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      log.warn({ err: exchangeError }, 'code exchange failed')
      return NextResponse.redirect(new URL('/login?error=auth_failed', origin))
    }

    const user = data.user

    if (user) {
      const metadata = user.user_metadata ?? {}
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert(
          {
            id: user.id,
            email: user.email,
            full_name:
              user.user_metadata?.full_name ??
              metadata.full_name ??
              null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
            role: metadata.role ?? 'staff',
            department: metadata.department ?? '',
            phone: metadata.phone ?? '',
            company_id: metadata.company_id ?? null,
            status: metadata.status ?? 'active',
            last_sign_in_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' },
        )

      if (profileError) {
        log.error({ err: profileError, userId: user.id }, 'profile upsert failed during callback')
      }
    }

    log.info({ userId: user?.id }, 'oauth callback completed')
    return NextResponse.redirect(new URL(next, origin))
  } catch (error) {
    log.error({ err: error }, 'unhandled callback error')
    return NextResponse.redirect(new URL('/login?error=server_error', origin))
  }
}
