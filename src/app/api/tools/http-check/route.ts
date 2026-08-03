import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: '请输入 URL' }, { status: 400 })
  }

  try {
    const startTime = Date.now()
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    })
    const responseTime = Date.now() - startTime

    return NextResponse.json({
      url,
      status: response.status,
      statusText: response.statusText,
      responseTime,
      redirected: response.redirected,
      finalUrl: response.url,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '请求失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
