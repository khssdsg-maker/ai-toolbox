import { NavigationItem } from '../types/navigation'

export const navigationItems: NavigationItem[] = [
  {
    id: 'common',
    title: '常用推荐',
    icon: 'linecons-star',
    items: [],
    subCategories: []
  },
  {
    id: 'tools',
    title: '常用工具',
    icon: 'linecons-diamond',
    items: [
      { 
        title: '在线工具',
        titleEn: 'Online Tools',
        description: '在线工具描述',
        descriptionEn: 'Online tools description',
        icon: 'default-icon',
        href: '#在线工具' 
      },
      { 
        title: '图形创意',
        titleEn: 'Graphic Design',
        description: '图形创意描述',
        descriptionEn: 'Graphic design description',
        icon: 'default-icon',
        href: '#图形创意' 
      },
      { 
        title: '界面设计',
        titleEn: 'UI Design',
        description: '界面设计描述',
        descriptionEn: 'UI design description',
        icon: 'default-icon',
        href: '#界面设计' 
      },
      { 
        title: '交互动效',
        titleEn: 'Interaction Effects',
        description: '交互动效描述',
        descriptionEn: 'Interaction effects description',
        icon: 'default-icon',
        href: '#交互动效' 
      },
      { title: '在线配色', titleEn: 'Online Color Matching', description: '在线配色描述', descriptionEn: 'Online color matching description', icon: 'default-icon', href: '#在线配色' },
      { title: 'Chrome插件', titleEn: 'Chrome Extensions', description: 'Chrome插件描述', descriptionEn: 'Chrome extensions description', icon: 'default-icon', href: '#Chrome插件' }
    ],
    subCategories: []
  },
  {
    id: 'community',
    title: '社区资讯',
    icon: 'linecons-doc',
    items: [],
    subCategories: []
  },
  {
    id: 'inspiration',
    title: '灵感采集',
    icon: 'linecons-lightbulb',
    items: [
      { 
        title: '发现产品',
        titleEn: 'Discover Products',
        description: '发现优秀产品',
        descriptionEn: 'Discover great products',
        icon: 'linecons-star',
        href: '#发现产品'
      },
    
    ],
    subCategories: []
  },
  {
    id: 'resources',
    title: '素材资源',
    icon: 'linecons-thumbs-up',
    items: [
      { 
        title: '图标素材',
        titleEn: 'Icon Resources',
        description: '图标素材库',
        descriptionEn: 'Icon resources library',
        icon: 'default-icon',
        href: '#图标素材'
      },
      { 
        title: 'LOGO设计',
        titleEn: 'Logo Design',
        description: 'LOGO设计资源',
        descriptionEn: 'Logo design resources',
        icon: 'default-icon',
        href: '#LOGO设计'
      },
      { 
        title: '平面素材',
        titleEn: 'Graphic Resources',
        description: '平面设计素材',
        descriptionEn: 'Graphic design resources',
        icon: 'default-icon',
        href: '#平面素材'
      }
    ],
    subCategories: []
  },
  {
    id: 'learning',
    title: '学习教程',
    icon: 'linecons-pencil',
    items: [
      { 
        title: '设计规范',
        titleEn: 'Design Guidelines',
        description: '设计规范和标准',
        descriptionEn: 'Design guidelines and standards',
        icon: 'default-icon',
        href: '#设计规范'
      }
    ],
    subCategories: []
  },
  {
    id: 'ued',
    title: 'UED团队',
    icon: 'linecons-user',
    items: [],
    subCategories: []
  },
  {
    id: 'about',
    title: '关于本站',
    icon: 'linecons-heart',
    items: [],
    subCategories: []
  }
] 