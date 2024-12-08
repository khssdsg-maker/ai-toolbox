export interface NavigationSubItem {
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  icon: string
  href: string
}

export interface NavigationCategory {
  id: string
  title: string
  items: NavigationSubItem[]
}

export interface NavigationItem {
  id: string
  title: string
  icon: string
  items: NavigationSubItem[]
  subCategories: NavigationCategory[]
}

export interface NavigationData {
  navigationItems: NavigationItem[]
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

export interface ResourceData {
  resourceSections: ResourceSection[]
} 