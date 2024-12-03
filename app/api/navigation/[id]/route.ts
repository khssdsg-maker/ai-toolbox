import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { NavigationItem } from '@/types/navigation'

const dataPath = path.join(process.cwd(), 'app/data/db/navigation.json')

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await fs.readFile(dataPath, 'utf8')
    const navigationItems: NavigationItem[] = JSON.parse(data)
    const category = navigationItems.find(item => item.id === params.id)
    
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
    const data = await fs.readFile(dataPath, 'utf8')
    const navigationItems: NavigationItem[] = JSON.parse(data)
    
    const index = navigationItems.findIndex(item => item.id === params.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    navigationItems[index] = category
    await fs.writeFile(dataPath, JSON.stringify(navigationItems, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save navigation data' }, { status: 500 })
  }
} 