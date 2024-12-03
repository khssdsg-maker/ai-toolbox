import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    if (!req.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.next()
    }

    const isLoggedIn = !!req.nextauth.token
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/api/auth/signin', req.nextUrl))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (!req.nextUrl.pathname.startsWith('/admin')) {
          return true
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/api/:path*']
} 