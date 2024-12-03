import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { commitFile, getFileContent } from '@/lib/github'
import type { ResourceData } from '@/types/navigation'

export const runtime = 'edge'

export async function GET() {
  try {
    const data = await getFileContent('app/data/db/resources.json') as ResourceData
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch resources data:', error)
    return NextResponse.json({
      resourceSections: []
    } as ResourceData)
  }
} 