'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/registry/new-york/ui/button'
import { Icons } from '@/components/icons'
import { ScrollArea } from '@/registry/new-york/ui/scroll-area'
import type { NavigationData } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'

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
            <Icons.logo className="h-6 w-6" />
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
                    className="w-full justify-start"
                    onClick={() => scrollToSection(category.id)}
                  >
                    <Icons.folder className="mr-2 h-4 w-4" />
                    {category.title}
                  </Button>
                  
                  {category.subCategories && category.subCategories.length > 0 && (
                    <div className="ml-4 space-y-1">
                      {category.subCategories.map((subCategory) => (
                        <Button
                          key={subCategory.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => scrollToSection(subCategory.id)}
                        >
                          <Icons.corner className="mr-2 h-3 w-3" />
                          {subCategory.title}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {pathname.startsWith("/admin") && (
            <div className="py-2">
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                管理
              </h2>
              <div className="space-y-1">
                <Button
                  variant={pathname.startsWith("/admin") ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/admin/navigation">
                    <Icons.settings className="mr-2 h-4 w-4" />
                    导航管理
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
