import { NextResponse } from 'next/server'
import { Auth } from '@auth/core'
import { authConfig } from '@/app/api/auth/[...nextauth]/auth'
import navigationData from '@/app/data/db/navigation.json'
import { commitFile } from '@/lib/github'

export const runtime = 'edge'

export async function POST(request: Request) {
  const req = new Request(request.url, {
    headers: request.headers,
    method: request.method,
  })
  
  const session = await Auth(req, authConfig)
  const token = session?.user?.accessToken

  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }

  const data = await request.json()

  try {
    await commitFile(
      'app/data/db/navigation.json',
      JSON.stringify(data, null, 2),
      'Update navigation data',
      token
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save navigation data:', error)
    return NextResponse.json({ error: 'Failed to save navigation data' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(navigationData)
} 