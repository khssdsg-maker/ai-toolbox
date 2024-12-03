import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import navigationData from '@/app/data/db/navigation.json'
import { commitFile } from '@/lib/github'
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
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data: NavigationItem[] = await request.json()
    
    await commitFile(
      'app/data/db/navigation.json',
      JSON.stringify(data, null, 2),
      'Update navigation data',
      session.user.accessToken
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save navigation data' }, { status: 500 })
  }
} 