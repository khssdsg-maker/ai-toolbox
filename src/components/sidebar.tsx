'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/registry/new-york/ui/button'
import { ScrollArea } from '@/registry/new-york/ui/scroll-area'
import type { NavigationData, NavigationItem } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'
import * as LucideIcons from 'lucide-react'
import { ChevronDown, ChevronRight, X, Settings, Plus, GripVertical } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { SettingsDialog } from '@/components/settings-dialog'
import { LanguageToggle } from '@/components/language-toggle'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  navigationData: NavigationData
  siteInfo: SiteConfig
  onClose?: () => void
  onAddCategory?: () => void
  onReorderCategories?: (reorderedItems: NavigationItem[]) => void
}

export function Sidebar({ className, navigationData, siteInfo, onClose, onAddCategory, onReorderCategories }: SidebarProps) {
  const { locale, t } = useLanguage()
  const [showSettings, setShowSettings] = useState(false)

  // 🌟 分类拖拽重排状态
  const [catDragState, setCatDragState] = useState<{ dragIdx: number; hoverIdx: number } | null>(null)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      onClose?.()
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    scrollToSection(categoryId)
    const category = navigationData.navigationItems.find(cat => cat.id === categoryId)
    if (category?.subCategories && category.subCategories.length > 0) {
      toggleCategory(categoryId)
    }
  }

  const renderIcon = (iconName?: string) => {
    if (!iconName) return <LucideIcons.Folder className="h-4 w-4" />

    if (iconName.startsWith('/') || iconName.startsWith('http')) {
      return (
        <Image
          src={iconName}
          alt="icon"
          width={16}
          height={16}
          className="h-4 w-4"
        />
      )
    }

    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName] || LucideIcons.Folder
    return <IconComponent className="h-4 w-4" />
  }

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    return navigationData.navigationItems.reduce((acc, category) => {
      acc[category.id] = false
      return acc
    }, {} as Record<string, boolean>)
  })

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  // 🌟 分类拖拽排序处理
  const handleCatDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData('text/plain', `cat-${idx}`)
    setCatDragState({ dragIdx: idx, hoverIdx: idx })
  }

  const handleCatDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (!catDragState) return
    if (catDragState.hoverIdx !== idx) {
      setCatDragState(prev => prev ? { ...prev, hoverIdx: idx } : null)
    }
  }

  const handleCatDragEnd = () => {
    if (!catDragState) return
    const { dragIdx, hoverIdx } = catDragState
    if (dragIdx !== hoverIdx && onReorderCategories) {
      const items = [...navigationData.navigationItems]
      const [moved] = items.splice(dragIdx, 1)
      items.splice(hoverIdx, 0, moved)
      onReorderCategories(items)
    }
    setCatDragState(null)
  }

  return (
    <div className={cn("w-full flex flex-col h-full", className)}>
      {/* 头部 Brand */}
      <div className="flex h-14 items-center px-4 flex-shrink-0 border-b border-border/40">
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
          <span className="font-bold text-sm tracking-tight">{siteInfo.basic.title}</span>
        </Link>

        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto sm:hidden"
            onClick={onClose}
            aria-label="关闭侧边栏"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 纯粹专注的 AI 工具分类导航列表 */}
      <ScrollArea className="flex-1 px-3 py-3">
        <div className="flex items-center justify-between px-2 pb-2">
          <p className="text-[11px] font-semibold text-muted-foreground/70 tracking-wider">
            {t('AI 分类导航 (可拖拽排序)', 'AI CATEGORIES')}
          </p>
          {onAddCategory && (
            <button
              onClick={onAddCategory}
              className="text-[11px] text-primary hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
              title={t('新建自定义分类', 'Add Custom Category')}
            >
              <Plus className="w-3 h-3" />
              <span>{t('新建', 'New')}</span>
            </button>
          )}
        </div>

        <div className="space-y-0.5">
          {navigationData.navigationItems.map((category, idx) => {
            const isCustom = (category as NavigationItem & { isCustomCategory?: boolean }).isCustomCategory
            const isDragging = catDragState?.dragIdx === idx

            return (
              <div
                key={category.id}
                draggable
                onDragStart={(e) => handleCatDragStart(e, idx)}
                onDragOver={(e) => handleCatDragOver(e, idx)}
                onDragEnd={handleCatDragEnd}
                className={cn(
                  "py-0.5 rounded-lg transition-all duration-200 group relative",
                  isDragging && "opacity-30 scale-95 border border-dashed border-primary"
                )}
              >
                <div className="flex items-center">
                  <div className="opacity-0 group-hover:opacity-40 transition-opacity cursor-grab text-muted-foreground pl-1 -mr-1">
                    <GripVertical className="h-3 w-3" />
                  </div>
                  <Button
                    variant="ghost"
                    className="flex-1 justify-start gap-2 font-medium text-muted-foreground hover:text-foreground cursor-pointer h-8 text-xs group"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    {renderIcon(category.icon)}
                    <span className="truncate">{locale === 'en' && category.titleEn ? category.titleEn : category.title}</span>
                    {isCustom && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                        {t('自建', 'Custom')}
                      </span>
                    )}
                  </Button>

                  {category.subCategories && category.subCategories.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2 hover:bg-transparent cursor-pointer h-8"
                      onClick={() => toggleCategory(category.id)}
                    >
                      {expandedCategories[category.id] ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>
                  )}
                </div>

                {category.subCategories && category.subCategories.length > 0 && (
                  <div
                    className={cn(
                      "grid transition-all duration-200 ease-in-out pl-6",
                      expandedCategories[category.id] ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden space-y-0.5 py-1">
                      {category.subCategories.map((sub) => (
                        <Button
                          key={sub.id}
                          variant="ghost"
                          className="w-full justify-start text-xs font-normal text-muted-foreground hover:text-foreground h-7 px-2"
                          onClick={() => handleCategoryClick(sub.id)}
                        >
                          {sub.title}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* 底部设置与多语言 */}
      <div className="p-3 border-t border-border/40 flex items-center justify-between flex-shrink-0 bg-muted/10">
        <LanguageToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(true)}
          className="h-8 w-8 hover:bg-accent/50 text-muted-foreground"
          aria-label={t('设置', 'Settings')}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
