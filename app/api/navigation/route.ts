import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { NavigationItem } from '@/types/navigation'

const dataPath = path.join(process.cwd(), 'app/data/db/navigation.json')

export const runtime = 'edge'

export async function GET() {
  try {
    const data = await fs.readFile(dataPath, 'utf8')
    const navigationItems: NavigationItem[] = JSON.parse(data)
    return NextResponse.json(navigationItems)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read navigation data' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data: NavigationItem[] = await request.json()
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save navigation data' }, { status: 500 })
  }
} 