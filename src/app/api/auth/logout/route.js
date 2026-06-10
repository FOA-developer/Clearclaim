import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import supabaseAdmin from '@/lib/supabase/admin'
import { AppError } from '@/lib/errors/AppError'
import { createRequestLogger } from '@/lib/logger'

/**
 * POST /api/auth/logout
 *
 * 1. Reads the current session from cookies to identify the user.
 * 2. Revokes the session server-side via the admin client (service role).
 * 3. Signs out through the cookie client to clear httpOnly cookies.
 *
 * Admin revocation ensures the JWT is invalidated even if the
 * client never receives the cookie-clearing response.
 */
export async function POST(request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  const log = createRequestLogger({ requestId, route: 'POST /api/auth/logout' })

  try {
    const cookieClient = await createClient()

    const { data: { user } } = await cookieClient.auth.getUser()

    if (user) {
      const { error: revokeError } = await supabaseAdmin.auth.admin.signOut(
        user.id,
        'global',
      )

      if (revokeError) {
        log.warn({ err: revokeError, userId: user.id }, 'admin session revocation failed')
      } else {
        log.info({ userId: user.id }, 'all sessions revoked via admin')
      }
    }

    const { error: signOutError } = await cookieClient.auth.signOut()

    if (signOutError) {
      log.error({ err: signOutError }, 'cookie signOut failed')
      throw AppError.internal('Failed to clear session')
    }

    log.info('logout complete')

    return NextResponse.json({ success: true, redirectTo: '/login' })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode })
    }

    log.error({ err: error }, 'unhandled logout error')
    return NextResponse.json(AppError.internal().toJSON(), { status: 500 })
  }
}
