import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Protect /admin/* routes (except /admin/login) by checking the session cookie.
 * The cookie value is compared against ADMIN_PASSWORD from env vars.
 * Runs in Edge runtime — no Node.js crypto module needed.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip the login page itself
  if (pathname === '/admin/login') return NextResponse.next()

  const session = request.cookies.get('admin_session')?.value
  const expected = process.env.ADMIN_PASSWORD

  if (!expected || session !== expected) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
