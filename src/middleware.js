import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

const PUBLIC_ROUTES = new Set(['/', '/login'])
const AUTH_API_ROUTES = ['/api/auth/login', '/api/auth/signup', '/api/auth/callback']
const STATIC_PREFIXES = ['/_next', '/favicon.ico', '/api/auth/callback']

function isStaticOrAsset(pathname) {
  return STATIC_PREFIXES.some((p) => pathname.startsWith(p))
}

/**
 * Next.js Edge Middleware
 *
 * Runs on every matched request before it reaches a route handler or page.
 * Responsibilities:
 *   1. Inject a unique x-request-id header for distributed tracing.
 *   2. Refresh the Supabase auth session (rewrite cookies if token was rotated).
 *   3. Redirect unauthenticated users away from protected routes.
 *   4. Redirect authenticated users away from login (they're already signed in).
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl

  if (isStaticOrAsset(pathname)) {
    return NextResponse.next()
  }

  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()

  const { supabase, response } = await createMiddlewareClient(request)

  response.headers.set('x-request-id', requestId)

  const { data: { user } } = await supabase.auth.getUser()

  const isPublic = PUBLIC_ROUTES.has(pathname)
  const isAuthApi = AUTH_API_ROUTES.some((r) => pathname.startsWith(r))

  if (!user && !isPublic && !isAuthApi) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
