export interface NavigationItem {
  id: string
  title: string
  icon: string
  items?: {
    title: string
    href: string
  }[]
}

export interface ResourceItem {
  title: string
  description: string
  icon: string
  url: string
}

export interface ResourceSection {
  id: string
  title: string
  items: ResourceItem[]
} 