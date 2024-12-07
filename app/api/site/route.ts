import { NextResponse } from 'next/server'
import siteData from '@/navsphere/content/site.json'
import type { SiteInfo } from '@/types/site'

export const runtime = 'edge'

export async function GET() {
  try {
    return NextResponse.json(siteData)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read site data' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data: SiteInfo = await request.json()
    // 在 Edge Runtime 中，我们需要通过 API 来保存数据
    // 这里可以调用其他服务或数据库
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save site data' }, { status: 500 })
  }
} 