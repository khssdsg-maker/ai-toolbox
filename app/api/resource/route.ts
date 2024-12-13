// app/api/resource-metadata/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { commitFile, getFileContent } from '@/lib/github'
import type { ResourceMetadata } from '@/types/resource-metadata'

export const runtime = 'edge'

export async function GET() {
    try {
        const data = await getFileContent('navsphere/content/resource-metadata') as ResourceMetadata
        if (!data || !data.metadata || !Array.isArray(data.metadata)) {
            throw new Error('Invalid data structure');
        }
        return NextResponse.json(data)
      } catch (error) {
        console.error('Failed to fetch resource metadata:', error)
        return NextResponse.json({ error: 'Failed to fetch resource metadata' }, { status: 500 })
      }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.accessToken) {
      return new Response('Unauthorized', { status: 401 })
    }

    const data = await request.json()
    
    // 提交到 GitHub
    await commitFile(
      'navsphere/content/resource-metadata.json',
      JSON.stringify(data, null, 2),
      'Update resource metadata',
      session.user.accessToken
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save resource metadata:', error)
    return NextResponse.json(
      { error: 'Failed to save resource metadata' },
      { status: 500 }
    )
  }
}