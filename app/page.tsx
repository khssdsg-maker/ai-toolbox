export const runtime = 'edge'

import { NavigationContent } from '@/components/navigation-content'
import { headers } from 'next/headers'
import { Metadata, ResolvingMetadata } from 'next/types'


async function getData() {
  try {
    // Dynamically construct base URL
    const host = headers().get('host')
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    
    // Fallback to a complete URL if environment variables are not set
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                    (host ? `${protocol}://${host}` : 'http://localhost:3000')

    console.log('Base URL:', baseUrl)

    const [navigationRes, siteRes] = await Promise.all([
      fetch(new URL('/api/home/navigation', baseUrl).toString(), { 
        next: { 
          revalidate: 3600 // 1 hour 
        } 
      }),
      fetch(new URL('/api/home/site', baseUrl).toString(), { 
        next: { 
          revalidate: 3600 // 1 hour 
        } 
      })
    ])

    // Log status codes for debugging
    console.log('Navigation response status:', navigationRes.status)
    console.log('Site response status:', siteRes.status)

    if (!navigationRes.ok || !siteRes.ok) {
      console.error('Failed to fetch data', {
        navigationStatus: navigationRes.status,
        siteStatus: siteRes.status
      })
      throw new Error('Failed to fetch data')
    }

    const [navigationData, siteData] = await Promise.all([
      navigationRes.json(),
      siteRes.json()
    ])

    return { navigationData, siteData }
  } catch (error) {
    console.error('Error in getData:', error)
    return {
      navigationData: { navigationItems: [] },
      siteData: {
        basic: {
          title: 'NavSphere',
          description: '',
          keywords: ''
        },
        appearance: {
          logo: '',
          favicon: '',
          theme: 'system'
        }
      }
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { siteData } = await getData()
  
  return {
    title: siteData.basic.title,
    description: siteData.basic.description,
    keywords: siteData.basic.keywords,
    icons: {
      icon: siteData.appearance.favicon,
    },
  }
}

export default async function HomePage() {
  const { navigationData, siteData } = await getData()
  return <NavigationContent navigationData={navigationData} siteData={siteData} />
}
