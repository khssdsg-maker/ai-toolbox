export interface SiteConfig {
  basic: {
    title: string
    description: string
    keywords: string
  }
  appearance: {
    logo: string
    favicon: string
    theme: 'light' | 'dark' | 'system'
  }
}

export interface SiteInfo {
  basic: {
    title: string
    description: string
    keywords: string
  }
  appearance: {
    logo: string
    favicon: string
    theme: string
  }
} 