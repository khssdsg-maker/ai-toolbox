'use client'

import { useState } from 'react'
import type { NavigationData } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'
import { NavigationCard } from '@/components/navigation-card'
import { Sidebar } from '@/components/sidebar'
import { SearchBar } from '@/components/search-bar'
import { ModeToggle } from '@/components/mode-toggle'
import { Footer } from '@/components/footer'

interface NavigationContentProps {
  navigationData: NavigationData
  siteData: SiteConfig
}

export function NavigationContent({ navigationData, siteData }: NavigationContentProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter navigation items based on search query
  const filteredItems = navigationData.navigationItems.map(category => ({
    ...category,
    subCategories: category.subCategories?.map(subCategory => ({
      ...subCategory,
      items: subCategory.items?.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(subCategory => subCategory.items && subCategory.items.length > 0),
    items: category.items?.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => 
    (category.subCategories && category.subCategories.length > 0) ||
    (category.items && category.items.length > 0)
  )

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {/* 左侧边栏 */}
        <Sidebar className="w-60 shrink-0" navigationData={navigationData} siteInfo={siteData} />
        
        {/* 主内容区域 */}
        <div className="flex-1">
          {/* 顶部搜索栏 */}
          <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4">
              <div className="flex-1">
                <SearchBar onSearch={setSearchQuery} />
              </div>
              <ModeToggle />
            </div>
          </div>

          {/* 导航内容 */}
          <main className="flex-1 overflow-auto p-6">
            <div className="space-y-8">
              {filteredItems.map((category) => (
                <section key={category.id} id={category.id}>
                  {/* 分类标题 */}
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      {category.title}
                    </h2>
                  </div>

                  {/* 子分类 */}
                  {category.subCategories && category.subCategories.length > 0 ? (
                    category.subCategories.map((subCategory) => (
                      <div key={subCategory.id} id={subCategory.id} className="mb-6">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">
                          {subCategory.title}
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {subCategory.items?.map((item) => (
                            <NavigationCard key={item.id} item={item} />
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {category.items?.map((item) => (
                        <NavigationCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* 页脚 */}
      <Footer siteInfo={siteData} />
    </div>
  )
}
