'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import type { NavigationData, NavigationItem, NavigationSubItem } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'
import { NavigationCard } from '@/components/navigation-card'
import { Sidebar } from '@/components/sidebar'
import { WindowControls } from '@/components/window-controls'
import { SearchBar } from '@/components/search-bar'
import { ModeToggle } from '@/components/mode-toggle'
import { Footer } from '@/components/footer'
import { Menu, Star, Plus, Sparkles, X, RotateCcw, Check, Loader2, Edit3, FolderPlus } from 'lucide-react'
import { Button } from "@/registry/new-york/ui/button"
import { SiteFavicon } from '@/components/site-favicon'
import Link from 'next/link'
import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'

interface NavigationContentProps {
  navigationData: NavigationData
  siteData: SiteConfig
}

export interface CustomToolItem extends NavigationSubItem {
  categoryId: string
  isCustom: true
}

export interface CustomCategoryItem {
  id: string
  title: string
  titleEn?: string
  icon?: string
}

export function NavigationContent({ navigationData, siteData }: NavigationContentProps) {
  const { t, locale } = useLanguage()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 常用置顶列表
  const [pinnedIds, setPinnedIds] = useState<string[]>([])
  // 自定义工具排序 { [catId]: itemId[] }
  const [customOrders, setCustomOrders] = useState<Record<string, string[]>>({})
  // 🌟 自定义分类顺序列表 string[] (category id 列表)
  const [categoryOrder, setCategoryOrder] = useState<string[]>([])

  // 🌟 实时弹性拖拽状态：记录正在拖拽的分类、原位置与实时悬浮让位位置
  const [dragState, setDragState] = useState<{
    catId: string
    dragId: string
    dragIdx: number
    hoverIdx: number
  } | null>(null)

  // 🌟 自定义工具列表 & 自定义分类列表
  const [customTools, setCustomTools] = useState<CustomToolItem[]>([])
  const [customCategories, setCustomCategories] = useState<CustomCategoryItem[]>([])

  // 添加/二次编辑工具弹窗状态
  const [showAddToolModal, setShowAddToolModal] = useState(false)
  const [editingToolId, setEditingToolId] = useState<string | null>(null)
  const [formUrl, setFormUrl] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCategory, setFormCategory] = useState<string>('0')

  // 🌟 独立的「添加工具分类」专属弹窗状态
  const [showAddCatModal, setShowAddCatModal] = useState(false)
  const [catFormName, setCatFormName] = useState('')
  const [catFormNameEn, setCatFormNameEn] = useState('')

  const [isFetchingMeta, setIsFetchingMeta] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  // 加载本地持久化数据
  useEffect(() => {
    try {
      const savedPinned = localStorage.getItem('ai-toolbox-pinned-tools')
      if (savedPinned) setPinnedIds(JSON.parse(savedPinned))
      const savedOrders = localStorage.getItem('ai-toolbox-custom-orders')
      if (savedOrders) setCustomOrders(JSON.parse(savedOrders))
      const savedCatOrder = localStorage.getItem('ai-toolbox-category-order')
      if (savedCatOrder) setCategoryOrder(JSON.parse(savedCatOrder))
      const savedTools = localStorage.getItem('ai-toolbox-custom-tools')
      if (savedTools) setCustomTools(JSON.parse(savedTools))
      const savedCats = localStorage.getItem('ai-toolbox-custom-categories')
      if (savedCats) setCustomCategories(JSON.parse(savedCats))
    } catch {}
  }, [])

  // 真实网页元数据抓取：调用 Electron 后台真实爬虫提取 Title 与 Meta 简介
  const handleAutoFetchMeta = async (urlToFetch?: string, force = false) => {
    const target = urlToFetch || formUrl
    if (!target || !target.trim()) return
    setIsFetchingMeta(true)

    try {
      const api = (window as unknown as {
        appAPI?: {
          fetchSiteMeta?: (url: string) => Promise<{ title?: string; description?: string }>
        }
      }).appAPI

      if (api && api.fetchSiteMeta) {
        const meta = await api.fetchSiteMeta(target.trim())
        if (meta) {
          if (meta.title && (force || !formTitle)) setFormTitle(meta.title)
          if (meta.description && (force || !formDesc)) setFormDesc(meta.description)
          if (force) {
            showToast(t('✅ 成功抓取官方标题与简介！', 'Successfully extracted site title & description!'))
          }
        }
      } else {
        try {
          const u = new URL(target.startsWith('http') ? target : `https://${target}`)
          const host = u.hostname.replace(/^www\./, '')
          const mainName = host.split('.')[0]
          if (mainName && (force || !formTitle)) {
            setFormTitle(mainName.charAt(0).toUpperCase() + mainName.slice(1))
          }
        } catch {}
      }
    } catch {
      // 静默降级
    } finally {
      setIsFetchingMeta(false)
    }
  }

  // 监听网址输入，失去焦点自动触发真实爬虫
  const handleUrlBlur = () => {
    if (formUrl && (!formTitle || !formDesc)) {
      handleAutoFetchMeta(formUrl, false)
    }
  }

  const togglePin = (id: string) => {
    setPinnedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      try { localStorage.setItem('ai-toolbox-pinned-tools', JSON.stringify(next)) } catch {}
      return next
    })
  }

  // 组合官方分类与自建分类，并按 categoryOrder 排序
  const mergedCategories = useMemo(() => {
    const list: Array<NavigationItem & { isCustomCategory?: boolean }> = [
      ...navigationData.navigationItems
    ]

    customCategories.forEach((cc) => {
      list.push({
        id: cc.id,
        title: cc.title,
        titleEn: cc.titleEn || cc.title,
        icon: 'Folder',
        items: [],
        enabled: true,
        isCustomCategory: true
      })
    })

    if (categoryOrder.length > 0) {
      list.sort((a, b) => {
        const idxA = categoryOrder.indexOf(a.id)
        const idxB = categoryOrder.indexOf(b.id)
        if (idxA !== -1 && idxB !== -1) return idxA - idxB
        if (idxA !== -1) return -1
        if (idxB !== -1) return 1
        return 0
      })
    }

    return list
  }, [navigationData.navigationItems, customCategories, categoryOrder])

  // 处理分类拖拽重排回调
  const handleReorderCategories = (reorderedItems: NavigationItem[]) => {
    const newOrderIds = reorderedItems.map(i => i.id)
    setCategoryOrder(newOrderIds)
    try {
      localStorage.setItem('ai-toolbox-category-order', JSON.stringify(newOrderIds))
    } catch {}
    showToast(t('✅ 分类排序已更新', 'Category order updated'))
  }

  // 打开新建工具弹窗
  const handleOpenAddToolModal = (catId?: string) => {
    setEditingToolId(null)
    setFormUrl('')
    setFormTitle('')
    setFormDesc('')
    setFormCategory(catId || (mergedCategories[0] ? mergedCategories[0].id : '0'))
    setShowAddToolModal(true)
  }

  // 打开二次编辑工具弹窗
  const handleOpenEditToolModal = (item: NavigationSubItem & { isCustom?: boolean; categoryId?: string }) => {
    setEditingToolId(item.id)
    setFormUrl(item.href)
    setFormTitle(item.title)
    setFormDesc(item.description || '')
    setFormCategory(item.categoryId || (mergedCategories[0] ? mergedCategories[0].id : '0'))
    setShowAddToolModal(true)
  }

  // 🌟 保存独立的自定义分类
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!catFormName.trim()) {
      showToast(t('请输入分类名称', 'Please enter category name'))
      return
    }

    const newCatId = `custom-cat-${Date.now()}`
    const newCat: CustomCategoryItem = {
      id: newCatId,
      title: catFormName.trim(),
      titleEn: catFormNameEn.trim() || catFormName.trim(),
    }

    const nextCats = [...customCategories, newCat]
    setCustomCategories(nextCats)
    try { localStorage.setItem('ai-toolbox-custom-categories', JSON.stringify(nextCats)) } catch {}

    setCatFormName('')
    setCatFormNameEn('')
    setShowAddCatModal(false)
    showToast(t(`✅ 已成功创建分类「${newCat.title}」！`, `Created category "${newCat.title}"!`))

    setTimeout(() => {
      const el = document.getElementById(newCatId)
      el?.scrollIntoView({ behavior: 'smooth' })
    }, 150)
  }

  // 保存自定义工具（新建或更新）
  const handleSaveCustomTool = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formUrl.trim() || !formTitle.trim()) {
      showToast(t('请填写工具名称与链接', 'Please fill name and URL'))
      return
    }

    const fullUrl = formUrl.startsWith('http') ? formUrl.trim() : `https://${formUrl.trim()}`

    if (editingToolId) {
      const nextTools = customTools.map((t) => {
        if (t.id === editingToolId) {
          return {
            ...t,
            title: formTitle.trim(),
            titleEn: formTitle.trim(),
            href: fullUrl,
            description: formDesc.trim(),
            descriptionEn: formDesc.trim(),
            categoryId: formCategory,
          }
        }
        return t
      })
      setCustomTools(nextTools)
      try { localStorage.setItem('ai-toolbox-custom-tools', JSON.stringify(nextTools)) } catch {}
      showToast(t(`✅ 已更新工具「${formTitle.trim()}」！`, `Updated tool "${formTitle.trim()}"!`))
    } else {
      const newTool: CustomToolItem = {
        id: `custom-tool-${Date.now()}`,
        title: formTitle.trim(),
        titleEn: formTitle.trim(),
        href: fullUrl,
        description: formDesc.trim(),
        descriptionEn: formDesc.trim(),
        categoryId: formCategory,
        isCustom: true,
        enabled: true
      }
      const nextTools = [...customTools, newTool]
      setCustomTools(nextTools)
      try { localStorage.setItem('ai-toolbox-custom-tools', JSON.stringify(nextTools)) } catch {}
      showToast(t(`✅ 已成功添加工具「${newTool.title}」！`, `Added tool "${newTool.title}"!`))
    }

    setShowAddToolModal(false)
    setEditingToolId(null)
  }

  // 删除自定义工具
  const handleDeleteCustomTool = (id: string) => {
    const nextTools = customTools.filter((t) => t.id !== id)
    setCustomTools(nextTools)
    try { localStorage.setItem('ai-toolbox-custom-tools', JSON.stringify(nextTools)) } catch {}
    showToast(t('已删除自定义工具', 'Custom tool deleted'))
  }

  // 恢复默认排版
  const handleResetLayout = () => {
    if (confirm(t('确定恢复官方默认排序吗？您的自定义工具与分类仍将保留。', 'Reset layout order to default? Custom tools & categories will be kept.'))) {
      setCustomOrders({})
      setCategoryOrder([])
      setPinnedIds([])
      try {
        localStorage.removeItem('ai-toolbox-custom-orders')
        localStorage.removeItem('ai-toolbox-category-order')
        localStorage.removeItem('ai-toolbox-pinned-tools')
      } catch {}
      showToast(t('已恢复默认排版顺序', 'Layout reset to default'))
    }
  }

  const getOrderedItems = useCallback((catId: string, rawItems: NavigationSubItem[]) => {
    const categoryCustomTools = customTools.filter((ct) => ct.categoryId === catId)
    const combined = [...rawItems, ...categoryCustomTools]

    const customOrder = customOrders[catId] || []
    let list = [...combined]
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

    const pinned = list.filter((i) => pinnedIds.includes(i.id))
    const unpinned = list.filter((i) => !pinnedIds.includes(i.id))
    return [...pinned, ...unpinned]
  }, [customTools, customOrders, pinnedIds])

  // =========================================================================
  // 🌊 物理弹性排版拖拽系统（卡片占位 + 周围卡片实时滑动让位）
  // =========================================================================
  const handleCardDragStart = (e: React.DragEvent, catId: string, item: NavigationSubItem, idx: number) => {
    e.dataTransfer.setData('text/plain', item.id)
    setDragState({
      catId,
      dragId: item.id,
      dragIdx: idx,
      hoverIdx: idx,
    })
  }

  const handleCardDragOver = (e: React.DragEvent, catId: string, hoverIdx: number) => {
    e.preventDefault()
    if (!dragState || dragState.catId !== catId) return
    if (dragState.hoverIdx !== hoverIdx) {
      setDragState((prev) => (prev ? { ...prev, hoverIdx } : null))
    }
  }

  const handleCardDragEnd = (catId: string, rawItems: NavigationSubItem[]) => {
    if (!dragState || dragState.catId !== catId) {
      setDragState(null)
      return
    }

    const { dragIdx, hoverIdx } = dragState
    if (dragIdx !== hoverIdx) {
      const ordered = getOrderedItems(catId, rawItems)
      const newOrdered = [...ordered]
      const [moved] = newOrdered.splice(dragIdx, 1)
      newOrdered.splice(hoverIdx, 0, moved)

      const newOrderIds = newOrdered.map((i) => i.id)
      setCustomOrders((prev) => {
        const next = { ...prev, [catId]: newOrderIds }
        try { localStorage.setItem('ai-toolbox-custom-orders', JSON.stringify(next)) } catch {}
        return next
      })
    }

    setDragState(null)
  }

  // 检测屏幕宽度
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

    mergedCategories.forEach((category) => {
      const allCategoryItems = [
        ...(category.items || []),
        ...customTools.filter((ct) => ct.categoryId === category.id)
      ]

      const items = allCategoryItems.filter((item) => {
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
        category.subCategories.forEach((sub) => {
          if (sub.enabled === false) return
          const subItems = (sub.items || []).filter((item) => {
            if (item.enabled === false) return false
            const titleMatch = item.title.toLowerCase().includes(query)
            const titleEnMatch = item.titleEn?.toLowerCase().includes(query) || false
            const descMatch = item.description?.toLowerCase().includes(query) || false
            const descEnMatch = item.descriptionEn?.toLowerCase().includes(query) || false
            return titleMatch || titleEnMatch || descMatch || descEnMatch
          })
          if (subItems.length > 0) {
            subResults.push({ title: sub.title, items: subItems })
          }
        })
      }

      if (items.length > 0 || subResults.length > 0) {
        results.push({ category, items, subCategories: subResults })
      }
    })

    return results
  }, [mergedCategories, customTools, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="min-h-screen bg-background relative flex">
      {/* 浮动提示反馈 */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-card border border-border shadow-2xl text-xs font-semibold text-foreground backdrop-blur-xl animate-in fade-in zoom-in-95">
          {toastMsg}
        </div>
      )}

      {/* 🌟 左侧栏：fixed 物理固定，位于胶囊岛右侧，完全独立，彻底杜绝重叠！ */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 sm:left-[58px] z-40 w-56 border-r border-border/30 bg-background/85 backdrop-blur-2xl transition-transform duration-300 ease-in-out',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <Sidebar
          navigationData={{ ...navigationData, navigationItems: mergedCategories }}
          siteInfo={siteData}
          onClose={() => setIsSidebarOpen(false)}
          onAddCategory={() => setShowAddCatModal(true)}
          onReorderCategories={handleReorderCategories}
        />
      </aside>

      {/* 🌟 主内容区：留足胶囊岛与侧边栏安全距离 */}
      <main className="flex-1 min-w-0 sm:pl-[58px] lg:pl-[282px] flex flex-col">
        {/* 顶部导航栏 */}
        <header
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
          className="sticky top-0 z-30 bg-background/70 backdrop-blur-2xl border-b border-border/30 select-none"
        >
          <div className="flex items-center gap-2.5 px-4 sm:px-8 h-14">
            <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} className="flex-1 min-w-0">
              <SearchBar
                navigationData={navigationData}
                onSearch={handleSearch}
                searchResults={searchResults}
                searchQuery={searchQuery}
                siteConfig={siteData}
              />
            </div>
            <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} className="flex items-center gap-1.5 flex-shrink-0">
              {/* 🌟 「+ 新建分类」专属按键 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddCatModal(true)}
                className="h-8 gap-1 text-xs font-medium text-muted-foreground hover:text-foreground hidden sm:flex"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>{t('新建分类', 'Add Category')}</span>
              </Button>

              {/* 🌟 「+ 添加工具」按键 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAddToolModal()}
                className="h-8 gap-1.5 text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('添加工具', 'Add Tool')}</span>
              </Button>

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

              {/* 独立顶部窗口控制键 (智能无损修复空白 / 最小化 / 最大化 / 关闭) */}
              <WindowControls />
            </div>
          </div>
        </header>

        {/* 主内容区 */}
        <div className="px-5 sm:px-10 pt-10 pb-8 flex-1">
          <div className="max-w-5xl mx-auto">
            {/* 首屏标题 */}
            <section className="mb-12 sm:mb-16 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl sm:text-[2.5rem] font-bold leading-[1.15] tracking-tight">
                  {t('AI 万能工具箱', 'AI Toolbox')}
                </h1>
                <p className="mt-2.5 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl">
                  {t('汇集全球优质 AI 工具，支持自定义添加工具、分类拖拽排序与自由弹性排版。', 'Curated AI tools with category & tool drag-and-drop reordering.')}
                </p>
              </div>

              {/* 重置排版辅助按钮 */}
              {(Object.keys(customOrders).length > 0 || categoryOrder.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetLayout}
                  className="gap-1 text-xs text-muted-foreground hover:text-foreground -mt-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('恢复默认排版', 'Reset Layout')}</span>
                </Button>
              )}
            </section>

            {/* 分类列表 */}
            <div className="space-y-12 sm:space-y-16">
              {mergedCategories.map((category) => {
                const categoryItems = getOrderedItems(category.id, category.items || [])
                const isCurrentCatDragging = dragState?.catId === category.id

                return (
                  <section
                    key={category.id}
                    id={category.id}
                    className="scroll-m-20 p-3 -m-3 rounded-2xl transition-all duration-250 ease-out"
                  >
                    {/* 分类标题栏 */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-baseline gap-3">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                          <span>{locale === 'en' && category.titleEn ? category.titleEn : category.title}</span>
                          {category.isCustomCategory && (
                            <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {t('自建分类', 'Custom Category')}
                            </span>
                          )}
                        </h2>
                        {categoryItems.length > 0 && (
                          <span className="text-xs text-muted-foreground tabular-nums font-medium">
                            {categoryItems.length}
                          </span>
                        )}
                      </div>

                      {/* 快捷为此分类添加工具 */}
                      <button
                        onClick={() => handleOpenAddToolModal(category.id)}
                        title={t(`为此分类添加工具`, `Add tool to this category`)}
                        className="text-xs text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-muted transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[12px]">{t('添加工具', 'Add Tool')}</span>
                      </button>
                    </div>

                    <div className="mt-1.5 mb-4 feathered-divider" />

                    {/* 工具卡片列表 */}
                    {categoryItems.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 relative">
                        {categoryItems.map((item, itemIndex) => {
                          const isThisDragging = isCurrentCatDragging && dragState?.dragIdx === itemIndex

                          return (
                            <div
                              key={item.id}
                              onDragOver={(e) => handleCardDragOver(e, category.id, itemIndex)}
                              onDragEnd={() => handleCardDragEnd(category.id, category.items || [])}
                              className={cn(
                                'transition-all duration-200 ease-out',
                                isThisDragging && 'opacity-20 scale-95 border-2 border-dashed border-primary/60 rounded-xl'
                              )}
                            >
                              <NavigationCard
                                item={item}
                                siteConfig={siteData}
                                featured={itemIndex === 0 && categoryItems.length > 3}
                                isPinned={pinnedIds.includes(item.id)}
                                onTogglePin={togglePin}
                                onDragStart={(e) => handleCardDragStart(e, category.id, item, itemIndex)}
                                isDragging={isThisDragging}
                                onDeleteCustom={handleDeleteCustomTool}
                                onEditCustom={handleOpenEditToolModal}
                              />
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center border border-dashed border-border/60 rounded-xl text-muted-foreground text-xs flex flex-col items-center justify-center gap-2">
                        <span>{t('该分类暂无工具，随时点击右侧按钮添加', 'No tools in this category.')}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAddToolModal(category.id)}
                          className="h-7 text-xs gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{t('添加工具到此分类', 'Add tool here')}</span>
                        </Button>
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
          </div>
        </div>

        <Footer siteInfo={siteData} />
      </main>

      {/* ========================================================================= */}
      {/* 🌟 弹窗 1：独立的【新建工具分类】专属弹窗 */}
      {/* ========================================================================= */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-base">{t('新建工具分类', 'Add Custom Category')}</h2>
              </div>
              <button
                onClick={() => setShowAddCatModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t('分类名称 (中文) *', 'Category Name (Chinese) *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如: 我的日常工作流 / 摸鱼神器 / 量化投研"
                  value={catFormName}
                  onChange={(e) => setCatFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/80 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t('英文名称 (可选)', 'English Name (Optional)')}
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Daily Workflow"
                  value={catFormNameEn}
                  onChange={(e) => setCatFormNameEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/80 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddCatModal(false)}
                  className="h-9 px-4 text-xs"
                >
                  {t('取消', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 px-5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  {t('创建分类', 'Create Category')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 弹窗 2：添加 / 二次编辑自定义 AI 工具与真实爬虫抓取 */}
      {/* ========================================================================= */}
      {showAddToolModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  {editingToolId ? <Edit3 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <h2 className="font-bold text-base">
                  {editingToolId ? t('编辑自定义 AI 工具', 'Edit Custom AI Tool') : t('添加自定义 AI 工具', 'Add Custom AI Tool')}
                </h2>
              </div>
              <button
                onClick={() => setShowAddToolModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomTool} className="p-5 space-y-4 text-xs sm:text-sm">
              {/* 链接 URL + 实时 Logo 预览 + 一键自动爬虫解析 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    {t('工具网址链接 (URL) *', 'Website URL *')}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAutoFetchMeta(formUrl, true)}
                    disabled={!formUrl || isFetchingMeta}
                    className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 disabled:opacity-40"
                  >
                    {isFetchingMeta ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>{t('正在抓取官方信息...', 'Fetching site meta...')}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>{t('⚡ 自动抓取名称与简介', 'Auto-fetch Name & Desc')}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl border border-border/60 bg-muted/40 p-1 flex items-center justify-center flex-shrink-0">
                    <SiteFavicon title={formTitle || '预览'} href={formUrl} className="w-full h-full object-contain" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="https://v0.dev"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    onBlur={handleUrlBlur}
                    className="flex-1 px-3 py-2 rounded-xl bg-background border border-border/80 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {t('💡 输入网址后失去焦点或点击右上角按钮，将自动抓取官方标题与介绍说明', 'Enter URL to auto-extract official title & description')}
                </p>
              </div>

              {/* 工具名称（完全开放自由手动编辑） */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t('工具名称 (支持手动随意编辑) *', 'Tool Title (Fully Editable) *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="V0 by Vercel"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/80 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* 功能介绍（完全开放自由手动编辑） */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t('功能介绍说明 (支持手动随意编辑)', 'Description (Fully Editable)')}
                </label>
                <textarea
                  rows={2}
                  placeholder={t('AI 驱动的现代化前端界面生成与全栈原型构建', 'AI powered frontend UI & component generator')}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border/80 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* 归属分类选择 */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t('归属 AI 分类 *', 'Category *')}
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-background border border-border/80 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  >
                    {mergedCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} {c.isCustomCategory ? '(自建)' : ''}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddCatModal(true)}
                    className="h-9 px-3 text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t('新分类', 'New')}</span>
                  </Button>
                </div>
              </div>

              {/* 底部按键 */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddToolModal(false)}
                  className="h-9 px-4 text-xs"
                >
                  {t('取消', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 px-5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  {editingToolId ? t('保存修改', 'Save Changes') : t('确认添加', 'Save Tool')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
