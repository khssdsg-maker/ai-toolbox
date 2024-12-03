import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { commitFile, getFileContent } from '@/lib/github'
import type { NavigationData } from '@/types/navigation'

export const runtime = 'edge'

export async function GET() {
  console.log('Navigation API: Starting GET request')
  try {
    const data = await getFileContent('app/data/db/navigation.json') as NavigationData
    console.log('Navigation API: Successfully fetched data:', data)

    if (!data || !data.navigationItems) {
      console.log('Navigation API: Invalid data format, returning empty array')
      return NextResponse.json({ navigationItems: [] })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Navigation API: Failed to fetch data:', error)
    return NextResponse.json({
      navigationItems: []
    } as NavigationData)
  }
}

export async function POST(request: Request) {
  console.log('Navigation API: Starting POST request')
  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token?.accessToken) {
      console.error('Navigation API: No access token')
      return new Response('Unauthorized', { status: 401 })
    }

    const data = await request.json()
    console.log('Navigation API: Received data:', data)
    
    if (!Array.isArray(data)) {
      console.error('Navigation API: Invalid data format')
      throw new Error('Invalid data format')
    }

    await commitFile(
      'app/data/db/navigation.json',
      JSON.stringify({ navigationItems: data }, null, 2),
      'Update navigation data',
      token.accessToken as string
    )

    console.log('Navigation API: Successfully saved data')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Navigation API: Failed to save data:', error)
    return NextResponse.json(
      { error: 'Failed to save navigation data' },
      { status: 500 }
    )
  }
} 