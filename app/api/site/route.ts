import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { SiteInfo } from '@/types/site'

const dataPath = path.join(process.cwd(), 'app/data/db/site.json')

export async function GET() {
  try {
    const data = await fs.readFile(dataPath, 'utf8')
    const siteInfo: SiteInfo = JSON.parse(data)
    return NextResponse.json(siteInfo)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read site data' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data: SiteInfo = await request.json()
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save site data' }, { status: 500 })
  }
} 