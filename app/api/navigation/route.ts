import { NextResponse } from 'next/server'
import navigationData from '@/app/data/db/navigation.json'
import type { NavigationItem } from '@/types/navigation'

export const runtime = 'edge'

export async function GET() {
  try {
    return NextResponse.json(navigationData)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read navigation data' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data: NavigationItem[] = await request.json()
    // 在 Edge Runtime 中，我们需要通过 API 来保存数据
    // 这里可以调用其他服务或数据库
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save navigation data' }, { status: 500 })
  }
} 