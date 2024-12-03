import { NavigationItem } from '../types/navigation'

export const navigationItems: NavigationItem[] = [
  {
    id: 'common',
    title: '常用推荐',
    icon: 'linecons-star',
    items: []
  },
  {
    id: 'tools',
    title: '常用工具',
    icon: 'linecons-diamond',
    items: [
      { title: '在线工具', href: '#在线工具' },
      { title: '图形创意', href: '#图形创意' },
      { title: '界面设计', href: '#界面设计' },
      { title: '交互动效', href: '#交互动效' },
      { title: '在线配色', href: '#在线配色' },
      { title: 'Chrome插件', href: '#Chrome插件' }
    ]
  },
  {
    id: 'community',
    title: '社区资讯',
    icon: 'linecons-doc',
    items: []
  }
] 