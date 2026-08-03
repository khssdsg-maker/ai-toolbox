import type { SiteConfig } from '@/types/site'

export const siteConfig: SiteConfig = {
  basic: {
    title: 'AI万能工具箱',
    description: 'AI时代的超级工具箱',
    keywords: 'AI工具,AI导航,文件转换,ChatGPT,AI绘画'
  },
  appearance: {
    logo: '/logo.webp',
    favicon: '/favicon.webp',
    theme: 'system'
  },
  navigation: {
    linkTarget: '_blank'
  }
}

export function getSiteConfig(): SiteConfig {
  return siteConfig
}

