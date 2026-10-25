import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAuthenticatedRequest } from '@/lib/auth'

// Edge-safe: validates session signature at the edge level.
// Full user verification happens server-side in `getSession()` on every API route.
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow admin login page
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Protect all other admin routes
  if (pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('admin-session')?.value
    const adminId = request.cookies.get('admin-id')?.value

    // Verify session signature at edge level
    if (!isAuthenticatedRequest(sessionToken, adminId)) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
