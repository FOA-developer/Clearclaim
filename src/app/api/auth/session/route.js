import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'

/**
 * GET /api/auth/session
 *
 * 1. Verifies the session cookie via the cookie client (getUser — server-verified JWT).
 * 2. Fetches the full user profile from the profiles table via the admin client.
 *
 * Two calls run concurrently with Promise.all since the profile fetch uses
 * the user ID from the cookie (which is trusted after middleware refresh).
 * Falls back to auth-only data if the profile table hasn't been populated yet.
 */
export async function GET(request) {
  const startTime = performance.now()
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'GET /api/auth/session' })

  try {
    const cookieClient = await createClient()

    const { data: { user }, error: authError } = await cookieClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        AppError.unauthorized('No active session').toJSON(),
        { status: 401 },
      )
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, avatar_url, last_sign_in_at, created_at')
      .eq('id', user.id)
      .single()

    if (profileError) {
      log.warn({ err: profileError, userId: user.id }, 'profile fetch failed — returning auth data only')
    }

    const durationMs = Math.round(performance.now() - startTime)
    log.info({ userId: user.id, durationMs }, 'session retrieved')

    return NextResponse.json({
      user: profile
        ? {
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name,
            role: profile.role,
            avatarUrl: profile.avatar_url,
            lastSignInAt: profile.last_sign_in_at,
            createdAt: profile.created_at,
          }
        : {
            id: user.id,
            email: user.email,
            role: user.role,
            lastSignInAt: user.last_sign_in_at,
          },
    })
  } catch (error) {
    log.error({ err: error }, 'unhandled session error')
    return NextResponse.json(AppError.internal().toJSON(), { status: 500 })
  }
}
