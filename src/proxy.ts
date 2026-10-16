import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Edge-safe: only checks cookie presence. Full HMAC signature verification
// happens server-side in `getSession()` (Node runtime) on every API route.
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('admin-session')?.value
    const adminId = request.cookies.get('admin-id')?.value
    if (!session || !adminId) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
