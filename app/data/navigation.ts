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
  },
  {
    id: 'inspiration',
    title: '灵感采集',
    icon: 'linecons-lightbulb',
    items: [
      { title: '发现产品', href: '#发现产品' },
      { title: '界面灵感', href: '#界面灵感' },
      { title: '网页灵感', href: '#网页灵感' }
    ]
  },
  {
    id: 'resources',
    title: '素材资源',
    icon: 'linecons-thumbs-up',
    items: [
      { title: '图标素材', href: '#图标素材' },
      { title: 'LOGO设计', href: '#LOGO设计' },
      { title: '平面素材', href: '#平面素材' },
      { title: 'UI资源', href: '#UI资源' },
      { title: 'Sketch资源', href: '#Sketch资源' },
      { title: '字体资源', href: '#字体资源' },
      { title: 'Mockup', href: '#Mockup' },
      { title: '摄影图库', href: '#摄影图库' },
      { title: 'PPT资源', href: '#PPT资源' }
    ]
  },
  {
    id: 'learning',
    title: '学习教程',
    icon: 'linecons-pencil',
    items: [
      { title: '设计规范', href: '#设计规范' },
      { title: '视频教程', href: '#视频教程' },
      { title: '设计文章', href: '#设计文章' },
      { title: '设计电台', href: '#设计电台' },
      { title: '交互设计', href: '#交互设计' }
    ]
  },
  {
    id: 'ued',
    title: 'UED团队',
    icon: 'linecons-user',
    items: []
  },
  {
    id: 'about',
    title: '关于本站',
    icon: 'linecons-heart',
    items: []
  }
] 