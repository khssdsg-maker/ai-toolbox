import { ResourceSection } from '../types/navigation'

export const resourceSections: ResourceSection[] = [
  {
    id: 'common',
    title: '常用推荐',
    items: [
      {
        title: 'Google Analytics',
        description: 'Google分析（Google Analytics）是一个由Google所提供的网站流量统计服务。',
        icon: '/assets/images/logos/analytics.ico',
        url: 'https://analytics.google.com/'
      },
      {
        title: 'Vercel',
        description: 'Vercel 提供开发者工具和云基础设施，帮助构建、扩展和保护更快、更个性化的网络应用。',
        icon: '/assets/images/logos/vercel.png',
        url: 'https://vercel.com/'
      }
    ]
  }
] 