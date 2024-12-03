import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 只处理管理页面的请求
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      // 获取会话状态
      const sessionRes = await fetch(new URL('/api/auth/session', request.url), {
        headers: {
          cookie: request.headers.get('cookie') || ''
        }
      })

      const session = await sessionRes.json()

      if (!session?.user) {
        const signInUrl = new URL('/auth/signin', request.url)
        signInUrl.searchParams.set('callbackUrl', request.url)
        return NextResponse.redirect(signInUrl)
      }
    } catch (error) {
      console.error('Auth error:', error)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
} 