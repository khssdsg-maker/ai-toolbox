import { NextResponse } from 'next/server'
import navigationData from '@/navsphere/content/navigation.json'

export const runtime = 'edge'

export async function GET() {
  try {
    return NextResponse.json(navigationData)
  } catch (error) {
    console.error('Error in navigation API:', error)
    return NextResponse.json(
      { error: '获取导航数据失败' },
      { status: 500 }
    )
  }
} 