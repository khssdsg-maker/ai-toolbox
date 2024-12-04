import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { commitFile, getFileContent } from '@/lib/github'
import type { NavigationData } from '@/types/navigation'

export const runtime = 'edge'

export async function GET() {
  try {
    const data = await getFileContent('app/data/db/navigation.json') as NavigationData
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch navigation data:', error)
    return NextResponse.json({
      navigationItems: []
    } as NavigationData)
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.accessToken) {
      return new Response('Unauthorized', { status: 401 })
    }

    const data = await request.json()
    await commitFile(
      'app/data/db/navigation.json',
      JSON.stringify({ navigationItems: data }, null, 2),
      'Update navigation data',
      session.user.accessToken
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save navigation data:', error)
    return NextResponse.json(
      { error: 'Failed to save navigation data' },
      { status: 500 }
    )
  }
} 