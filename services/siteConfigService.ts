import { SiteConfig, SiteInfo } from '@/types/site'

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const response = await fetch('/api/site')
    if (!response.ok) throw new Error('Failed to fetch site config')
    const data: SiteInfo = await response.json()
    
    // 确保 theme 是有效的枚举值
    const validThemes = ['light', 'dark', 'system'] as const
    const theme = validThemes.includes(data.appearance.theme as any) 
      ? data.appearance.theme as 'light' | 'dark' | 'system'
      : 'system'

    return {
      basic: data.basic,
      appearance: {
        ...data.appearance,
        theme
      }
    }
  } catch (error) {
    console.error('Error fetching site config:', error)
    return {
      basic: {
        title: '',
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

export async function updateSiteConfig(config: SiteConfig): Promise<boolean> {
  try {
    const response = await fetch('/api/site', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    })
    
    if (!response.ok) throw new Error('Failed to update site config')
    return true
  } catch (error) {
    console.error('Error updating site config:', error)
    return false
  }
} 