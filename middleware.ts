import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Auth } from '@auth/core'
import { authConfig } from './app/api/auth/[...nextauth]/auth'

export const runtime = 'edge'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const req = new Request(request.url, {
      headers: request.headers,
      method: request.method,
    })
    
    const session = await Auth(req, authConfig)
    
    if (!session) {
      const url = new URL('/api/auth/signin', request.url)
      url.searchParams.set('callbackUrl', request.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
} 