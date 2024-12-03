import { NextResponse } from 'next/server'
import navigationData from '@/app/data/db/navigation.json'
import type { NavigationItem } from '@/types/navigation'

export const runtime = 'edge'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const category = navigationData.find(item => item.id === params.id)
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read navigation data' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const category: NavigationItem = await request.json()
    // 在 Edge Runtime 中，我们需要通过 API 来保存数据
    // 这里可以调用其他服务或数据库
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save navigation data' }, { status: 500 })
  }
} 