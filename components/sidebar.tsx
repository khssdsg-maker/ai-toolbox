'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/registry/new-york/ui/button'
import { ScrollArea } from '@/registry/new-york/ui/scroll-area'
import type { NavigationData } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'
import * as LucideIcons from 'lucide-react'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  navigationData: NavigationData
  siteInfo: SiteConfig
}

export function Sidebar({ className, navigationData, siteInfo }: SidebarProps) {
  const pathname = usePathname()

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const renderIcon = (iconName?: string) => {
    if (!iconName) return <LucideIcons.Folder className="h-4 w-4" />;
    
    if (iconName.startsWith('/') || iconName.startsWith('http')) {
      return (
        <Image
          src={iconName}
          alt="icon"
          width={16}
          height={16}
          className="h-4 w-4"
        />
      );
    }
    
    // Convert icon name to match Lucide icon component name
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Folder;
    return <IconComponent className="h-4 w-4" />;
  }

  return (
    <div className={cn("border-r bg-card", className)}>
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          {siteInfo.appearance.logo ? (
            <Image
              src={siteInfo.appearance.logo}
              alt={siteInfo.basic.title}
              width={24}
              height={24}
              className="h-6 w-6"
            />
          ) : (
            <LucideIcons.Globe className="h-6 w-6" />
          )}
          <span>{siteInfo.basic.title}</span>
        </Link>
      </div>
      <ScrollArea className="h-[calc(100vh-3.5rem)] px-3 py-2">
        <div className="space-y-4">
          <div className="py-2">
            <div className="space-y-1">
              {navigationData.navigationItems.map((category) => (
                <div key={category.id}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => scrollToSection(category.id)}
                  >
                    {renderIcon(category.icon)}
                    <span>{category.title}</span>
                  </Button>
                  {category.subCategories && category.subCategories.length > 0 && (
                    <div className="ml-4 mt-1 space-y-1">
                      {category.subCategories.map((subCategory) => (
                        <Button
                          key={subCategory.id}
                          variant="ghost"
                          className="w-full justify-start gap-2 text-sm"
                          onClick={() => scrollToSection(subCategory.id)}
                        >
                          {renderIcon(subCategory.icon)}
                          <span>{subCategory.title}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
