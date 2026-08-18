'use client'

import { useState, useMemo, useEffect } from 'react'
import type { NavigationData, NavigationItem, NavigationSubItem } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'
import { NavigationCard } from '@/components/navigation-card'
import { Sidebar } from '@/components/sidebar'
import { WindowControls } from '@/components/window-controls'
import { SearchBar } from '@/components/search-bar'
import { ModeToggle } from '@/components/mode-toggle'
import { Footer } from '@/components/footer'
import { Menu, Star } from 'lucide-react'
import { Button } from "@/registry/new-york/ui/button"
import Link from 'next/link'
import { useLanguage } from '@/lib/language-context'

interface NavigationContentProps {
  navigationData: NavigationData
  siteData: SiteConfig
}

export function NavigationContent({ navigationData, siteData }: NavigationContentProps) {
  const { t, locale } = useLanguage()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 常用置顶列表
  const [pinnedIds, setPinnedIds] = useState<string[]>([])
  // 自定义拖拽顺序 { [catId]: itemId[] }
  const [customOrders, setCustomOrders] = useState<Record<string, string[]>>({})
  const [draggingId, setDraggingId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const savedPinned = localStorage.getItem('ai-toolbox-pinned-tools')
      if (savedPinned) setPinnedIds(JSON.parse(savedPinned))
      const savedOrders = localStorage.getItem('ai-toolbox-custom-orders')
      if (savedOrders) setCustomOrders(JSON.parse(savedOrders))
    } catch {}
  }, [])

  const togglePin = (id: string) => {
    setPinnedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      try { localStorage.setItem('ai-toolbox-pinned-tools', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const getOrderedItems = (catId: string, rawItems: NavigationSubItem[]) => {
    if (!rawItems) return []
    const customOrder = customOrders[catId] || []

    let list = [...rawItems]
    if (customOrder.length > 0) {
      list.sort((a, b) => {
        const idxA = customOrder.indexOf(a.id)
        const idxB = customOrder.indexOf(b.id)
        if (idxA !== -1 && idxB !== -1) return idxA - idxB
        if (idxA !== -1) return -1
        if (idxB !== -1) return 1
        return 0
      })
    }

    // 常用置顶排序置顶
    const pinned = list.filter((i) => pinnedIds.includes(i.id))
    const unpinned = list.filter((i) => !pinnedIds.includes(i.id))
    return [...pinned, ...unpinned]
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id)
    setDraggingId(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, catId: string, targetId: string, rawItems: NavigationSubItem[]) => {
    e.preventDefault()
    if (!draggingId || draggingId === targetId) return
    const ordered = getOrderedItems(catId, rawItems)
    const dragIdx = ordered.findIndex((i) => i.id === draggingId)
    const targetIdx = ordered.findIndex((i) => i.id === targetId)
    if (dragIdx === -1 || targetIdx === -1) return

    const newOrdered = [...ordered]
    const [moved] = newOrdered.splice(dragIdx, 1)
    newOrdered.splice(targetIdx, 0, moved)

    const newOrderIds = newOrdered.map((i) => i.id)
    setCustomOrders((prev) => {
      const next = { ...prev, [catId]: newOrderIds }
      try { localStorage.setItem('ai-toolbox-custom-orders', JSON.stringify(next)) } catch {}
      return next
    })
    setDraggingId(null)
  }

  // 检测屏幕宽度，避免 CSS 响应式类失效
  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth < 640)
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])
  
  const [searchQuery, setSearchQuery] = useState('')

  const searchResults = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return []

    const results: Array<{
      category: NavigationItem
      items: (NavigationItem | NavigationSubItem)[]
      subCategories: Array<{
        title: string
        items: (NavigationItem | NavigationSubItem)[]
      }>
    }> = []

    navigationData.navigationItems.forEach(category => {
      const items = (category.items || []).filter(item => {
        if (item.enabled === false) return false
        const titleMatch = item.title.toLowerCase().includes(query)
        const titleEnMatch = item.titleEn?.toLowerCase().includes(query) || false
        const descMatch = item.description?.toLowerCase().includes(query) || false
        const descEnMatch = item.descriptionEn?.toLowerCase().includes(query) || false
        return titleMatch || titleEnMatch || descMatch || descEnMatch
      })

      const subResults: Array<{
        title: string
        items: (NavigationItem | NavigationSubItem)[]
      }> = []

      if (category.subCategories) {
        category.subCategories.forEach(sub => {
          if (sub.enabled === false) return
          const subItems = (sub.items || []).filter(item => {
            if (item.enabled === false) return false
            const titleMatch = item.title.toLowerCase().includes(query)
            const titleEnMatch = item.titleEn?.toLowerCase().includes(query) || false
            const descMatch = item.description?.toLowerCase().includes(query) || false
            const descEnMatch = item.descriptionEn?.toLowerCase().includes(query) || false
            return titleMatch || titleEnMatch || descMatch || descEnMatch
          })

          if (subItems.length > 0) {
            subResults.push({
              title: sub.title,
              items: subItems
            })
          }
        })
      }

      if (items.length > 0 || subResults.length > 0) {
        results.push({
          category,
          items,
          subCategories: subResults
        })
      }
    })

    return results
  }, [navigationData, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-background">
      {/* 经典侧边栏（备用展开） */}
      <div style={{ display: isMobile ? "none" : "block" }}>
        <Sidebar
          navigationData={navigationData}
          siteInfo={siteData}
          className="sticky top-0 h-screen hidden lg:block"
        />
      </div>

      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all"
        style={{ display: isMobile ? "block" : "none", opacity: isSidebarOpen ? 1 : 0, pointerEvents: isSidebarOpen ? "auto" : "none" }}
      >
        <div
          className="fixed inset-y-0 right-0 w-3/4 max-w-xs bg-background shadow-2xl transform transition-transform duration-300 ease-out"
          style={{ transform: isSidebarOpen ? "translateX(0)" : "translateX(100%)" }}
        >
          <Sidebar
            navigationData={navigationData}
            siteInfo={siteData}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      </div>

      <main className="flex-1 min-w-0 sm:pl-16 lg:pl-0">
        {/* 顶部导航栏（支持无边框拖拽移动窗口） */}
        <header
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
          className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/40 select-none"
        >
          <div className="flex items-center gap-4 px-5 sm:px-10 h-14">
            <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} className="flex-1 min-w-0">
              <SearchBar
                navigationData={navigationData}
                onSearch={handleSearch}
                searchResults={searchResults}
                searchQuery={searchQuery}
                siteConfig={siteData}
              />
            </div>
            <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} className="flex items-center gap-1.5">
              <ModeToggle />
              <Link href="/favorites" aria-label="我的收藏">
                <Button variant="ghost" size="icon" className="hover:bg-accent/50">
                  <Star className="h-[18px] w-[18px]" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden hover:bg-accent/50"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* 独立圆形悬浮窗口控制键 (最小化/关闭) */}
              <WindowControls />
            </div>
          </div>
        </header>

        {/* 主内容区 */}
        <div className="px-5 sm:px-10 pt-10 pb-8">
          <div className="max-w-5xl mx-auto">

            {/* 首屏标题 */}
            <section className="mb-14 sm:mb-20">
              <h1 className="text-3xl sm:text-[2.5rem] font-bold leading-[1.15] tracking-tight">
                {t('AI 万能工具箱', 'AI Toolbox')}
              </h1>
              <p className="mt-2.5 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl">
                {t('汇集全球优质 AI 工具，支持常用置顶与自由拖拽排序。', 'Curated AI tools — pin your favorites to top and drag to reorder.')}
              </p>
            </section>

            {/* 分类列表 */}
            <div className="space-y-14 sm:space-y-20">
            {navigationData.navigationItems.map((category) => {
              const categoryItems = getOrderedItems(category.id, category.items || [])
              return (
                <section key={category.id} id={category.id} className="scroll-m-20">
                  {/* 分类标题 */}
                  <div className="mb-5">
                    <div className="flex items-baseline gap-3">
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                        {locale === 'en' && category.titleEn ? category.titleEn : category.title}
                      </h2>
                      {categoryItems.length > 0 && (
                        <span className="text-xs text-muted-foreground tabular-nums font-medium">
                          {categoryItems.length}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 border-b border-border/40" />
                  </div>

                  {/* 工具卡片列表 */}
                  {categoryItems.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categoryItems.map((item, itemIndex) => (
                        <NavigationCard
                          key={item.id}
                          item={item}
                          siteConfig={siteData}
                          featured={itemIndex === 0 && categoryItems.length > 3}
                          isPinned={pinnedIds.includes(item.id)}
                          onTogglePin={togglePin}
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, category.id, item.id, category.items || [])}
                          isDragging={draggingId === item.id}
                        />
                      ))}
                    </div>
                  )}

                  {/* 子分类 */}
                  {category.subCategories && category.subCategories.length > 0 &&
                    category.subCategories.map((subCategory) => {
                      const subItems = getOrderedItems(subCategory.id, subCategory.items || [])
                      return (
                        <div key={subCategory.id} id={subCategory.id} className="mt-8">
                          <h3 className="text-sm font-medium text-muted-foreground/70 mb-2 pl-4">
                            {subCategory.title}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {subItems.map((item) => (
                              <NavigationCard
                                key={item.id}
                                item={item}
                                siteConfig={siteData}
                                isPinned={pinnedIds.includes(item.id)}
                                onTogglePin={togglePin}
                                onDragStart={(e) => handleDragStart(e, item.id)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, subCategory.id, item.id, subCategory.items || [])}
                                isDragging={draggingId === item.id}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                </section>
              )
            })}
            </div>
          </div>
        </div>

        <Footer siteInfo={siteData} />
      </main>
    </div>
  )
}
