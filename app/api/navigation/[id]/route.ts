import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { commitFile, getFileContent } from '@/lib/github'
import type { NavigationData, NavigationItem } from '@/types/navigation'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.accessToken) {
      return new Response('Unauthorized', { status: 401 })
    }

    const updatedItem = await request.json()
    const data = await getFileContent('navsphere/content/navigation.json') as NavigationData
    
    const updatedItems = data.navigationItems.map(item => 
      item.id === params.id ? { ...updatedItem, id: params.id } : item
    )

    await commitFile(
      'navsphere/content/navigation.json',
      JSON.stringify({ navigationItems: updatedItems }, null, 2),
      'Update navigation item',
      session.user.accessToken
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update navigation' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.accessToken) {
      return new Response('Unauthorized', { status: 401 })
    }

    const data = await getFileContent('navsphere/content/navigation.json') as NavigationData
    const updatedItems = data.navigationItems.filter(item => item.id !== params.id)

    await commitFile(
      'navsphere/content/navigation.json',
      JSON.stringify({ navigationItems: updatedItems }, null, 2),
      'Delete navigation item',
      session.user.accessToken
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete navigation' }, { status: 500 })
  }
} 