'use server'

import type { NavigationData } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'
import { NavigationContent } from '@/components/navigation-content'

async function getData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const [navigationRes, siteRes] = await Promise.all([
      fetch(`${baseUrl}/api/home/navigation`, { 
        next: { 
          revalidate: 3600 // 1 hour 
        } 
      }),
      fetch(`${baseUrl}/api/home/site`, { 
        next: { 
          revalidate: 3600 // 1 hour 
        } 
      })
    ])

    if (!navigationRes.ok || !siteRes.ok) {
      throw new Error('Failed to fetch data')
    }

    const [navigationData, siteData] = await Promise.all([
      navigationRes.json(),
      siteRes.json()
    ])

    return { navigationData, siteData }
  } catch (error) {
    console.error('Error fetching data:', error)
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

export default async function HomePage() {
  const { navigationData, siteData } = await getData()

  return <NavigationContent navigationData={navigationData} siteData={siteData} />
}
