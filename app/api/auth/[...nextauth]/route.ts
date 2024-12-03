import { Auth } from '@auth/core'
import { authConfig } from '@/app/auth.config'

export const runtime = 'edge'

async function handler(request: Request) {
  try {
    // 获取请求路径
    const url = new URL(request.url)
    const action = url.pathname.split('/auth/')[1]

    // 如果是会话请求，添加特殊处理
    if (action === 'session') {
      const response = await Auth(request, {
        ...authConfig,
        callbacks: {
          ...authConfig.callbacks,
          async session({ session, token }) {
            if (session?.user) {
              (session.user as any).accessToken = token.accessToken
            }
            return session
          }
        }
      })
      return response
    }

    // 其他请求正常处理
    const response = await Auth(request, authConfig)
    return response
  } catch (error) {
    console.error('Auth error:', error)
    return new Response(
      JSON.stringify({
        error: 'Authentication error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

export const GET = handler
export const POST = handler