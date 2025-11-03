import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that should be allowed without authentication
const ALLOWLIST = [
  '/login',
  '/forgot-password',
  '/favicon.ico',
  '/api/auth/checkActivo'
]

function isPublicPath(pathname: string) {
  if (ALLOWLIST.some((p) => pathname === p || pathname.startsWith(p + '/'))) return true
  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.startsWith('/api')) return true
  return false
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow Next internals, API routes and public static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.startsWith('/api') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  // If no cookies related to next-auth, and path is public, just continue
  const cookieHeader = req.headers.get('cookie') || ''
  const hasAuthCookie = cookieHeader.includes('next-auth') || cookieHeader.includes('__Secure-next-auth')

  // If there's no auth cookie and path is public, allow
  if (!hasAuthCookie && isPublicPath(pathname)) return NextResponse.next()

  // If there's no auth cookie and path is not public -> redirect to login
  if (!hasAuthCookie && !isPublicPath(pathname)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // At this point there is an auth cookie: verify active state via internal API
  try {
    const checkUrl = new URL('/api/auth/checkActivo', req.url)
    const res = await fetch(checkUrl.toString(), { headers: { cookie: cookieHeader } })

    if (res.status === 200) {
      const data = await res.json()
      if (!data.activo) {
        // User is inactive -> clear common next-auth cookies and redirect to login
        const resp = NextResponse.redirect(new URL('/login', req.url))
        const cookieNames = ['next-auth.session-token', '__Secure-next-auth.session-token', 'next-auth.callback-url', 'next-auth.csrf-token', '__Secure-next-auth.callback-url']
        for (const name of cookieNames) {
          resp.cookies.set(name, '', { path: '/', maxAge: 0 })
        }
        return resp
      }

      // active user
      return NextResponse.next()
    }

    // if check returned 401 (not authenticated) and path is protected -> redirect to login
    if ((res.status === 401 || res.status === 404) && !isPublicPath(pathname)) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  } catch (err) {
    console.error('middleware checkActivo error', err)
    // On error, be conservative: if path is protected, redirect to login
    if (!isPublicPath(pathname)) return NextResponse.redirect(new URL('/login', req.url))
    return NextResponse.next()
  }
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
