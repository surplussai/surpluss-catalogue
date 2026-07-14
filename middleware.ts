import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtected = path.startsWith('/import') || path.startsWith('/admin')

  if (isProtected) {
    const cookie = request.cookies.get('admin_auth')
    const password = process.env.ADMIN_PASSWORD || 'surpluss2024'
    if (cookie?.value !== password) {
      const url = new URL('/login', request.url)
      url.searchParams.set('redirectTo', path)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/import/:path*', '/admin/:path*'],
}
