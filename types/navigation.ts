export interface NavigationSubItem {
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  icon: string
  href: string
}

export interface NavigationSubCategory {
  id: string
  title: string
  items: NavigationSubItem[]
}

export interface NavigationItem {
  id: string
  title: string
  icon: string
  subCategories?: NavigationSubCategory[]
  items?: NavigationSubItem[]
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