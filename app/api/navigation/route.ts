import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { commitFile, getFileContent } from '@/lib/github'
import type { NavigationData } from '@/types/navigation'

export const runtime = 'edge'

export async function GET() {
  try {
    const data = await getFileContent('navsphere/content/navigation.json')
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch navigation data:', error)
    // 返回默认数据结构
    return NextResponse.json({
      navigationItems: []
    })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.accessToken) {
      return new Response('Unauthorized', { status: 401 })
    }

    const data = await request.json()
    
    // 验证数据结构
    if (!data.navigationItems || !Array.isArray(data.navigationItems)) {
      throw new Error('Invalid navigation data structure')
    }

    await commitFile(
      'navsphere/content/navigation.json',
      JSON.stringify(data, null, 2),
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