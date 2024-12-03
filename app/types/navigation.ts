export interface NavigationItem {
    id: string
    title: string
    icon: string
    items: {
        title: string
        href: string
    }[]
    subCategories: {
        id: string
        title: string
        items: {
            title: string
            href: string
        }[]
    }[]
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
  }
  
  export interface ResourceData {
    resourceSections: ResourceSection[]
  }