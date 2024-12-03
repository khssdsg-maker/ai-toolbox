import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getToken } from 'next-auth/jwt'
import { commitFile, getFileContent } from '@/lib/github'
import type { ResourceSection } from '@/types/navigation'

export const runtime = 'edge'

export async function POST(request: Request) {
  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token?.accessToken) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const data = await request.json()
    
    // 验证数据格式
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format')
    }

    // 构建完整的资源数据结构
    const resourcesData = {
      resourceSections: data
    }

    await commitFile(
      'app/data/db/resources.json',
      JSON.stringify(resourcesData, null, 2),
      'Update resources data',
      token.accessToken as string
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save resources data:', error)
    return NextResponse.json(
      { error: 'Failed to save resources data' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const data = await getFileContent('app/data/db/resources.json')
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch resources data:', error)
    // 如果文件不存在，返回空数据结构
    return NextResponse.json({
      resourceSections: []
    })
  }
} 