'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { NavigationSubItem } from '@/types/navigation'
import { SiteFavicon } from '@/components/site-favicon'
import type { SiteConfig } from '@/types/site'
import { useLanguage } from '@/lib/language-context'
import { ArrowUpRight, Pin, Heart, GripVertical, Trash2, Edit3, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isFavorited, toggleFavorite } from '@/lib/favorites'

interface NavigationCardProps {
  item: NavigationSubItem & { isCustom?: boolean; categoryId?: string }
  siteConfig?: SiteConfig
  featured?: boolean
  isPinned?: boolean
  onTogglePin?: (id: string) => void
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  isDragging?: boolean
  onDeleteCustom?: (id: string) => void
  onEditCustom?: (item: NavigationSubItem & { isCustom?: boolean; categoryId?: string }) => void
}

function getDomain(url?: string): string {
  if (!url) return ''
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    return parsed.hostname
  } catch {
    return ''
  }
}

export function NavigationCard({
  item,
  siteConfig,
  featured = false,
  isPinned = false,
  onTogglePin,
  draggable = true,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging = false,
  onDeleteCustom,
  onEditCustom,
}: NavigationCardProps) {
  const { locale, t } = useLanguage()
  const linkTarget = siteConfig?.navigation?.linkTarget || '_blank'

  const displayTitle = locale === 'en' && item.titleEn ? item.titleEn : item.title
  const displayDesc = locale === 'en' && item.descriptionEn ? item.descriptionEn : item.description

  const [fav, setFav] = useState(false)
  const [isRefreshingIcon, setIsRefreshingIcon] = useState(false)

  useEffect(() => {
    setFav(isFavorited(item.href))
    const updateHandler = () => setFav(isFavorited(item.href))
    window.addEventListener('ai-toolbox-favorites-updated', updateHandler)
    return () => window.removeEventListener('ai-toolbox-favorites-updated', updateHandler)
  }, [item.href])

  const handlePinClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onTogglePin) onTogglePin(item.id)
  }

  const handleFavClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const nowFav = toggleFavorite({
      title: item.title,
      href: item.href,
      description: item.description,
      icon: item.icon,
      category: 'ai-tool'
    })
    setFav(nowFav)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDeleteCustom && confirm(t(`确定删除自定义工具「${item.title}」吗？`, `Delete custom tool "${item.title}"?`))) {
      onDeleteCustom(item.id)
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onEditCustom) onEditCustom(item)
  }

  // 单卡片专属精准重新拉取图标（仅作用于当前这一个工具，绝不误伤或刷新其他卡片）
  const handleSingleCardRefreshIcon = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isRefreshingIcon) return
    setIsRefreshingIcon(true)

    const domain = getDomain(item.href)
    const targetKey = domain || (item.icon && item.icon.trim() !== '' ? `icon:${item.icon}` : item.title)

    window.dispatchEvent(
      new CustomEvent('ai-toolbox-refresh-single-card', {
        detail: { targetKey }
      })
    )

    setTimeout(() => setIsRefreshingIcon(false), 800)
  }

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        'group relative block cursor-grab active:cursor-grabbing select-none transition-all duration-250 ease-out',
        isDragging && 'opacity-30 scale-[0.96] rotate-1'
      )}
    >
      <Link
        href={item.href}
        target={linkTarget}
        rel="noopener noreferrer"
        className="block"
        title={displayDesc || displayTitle}
      >
        <div
          className={cn(
            'relative flex items-start gap-3 rounded-xl bg-card border px-3.5 py-3.5 transition-all duration-250 ease-out hover:shadow-lg hover:-translate-y-0.5',
            isPinned
              ? 'border-amber-500/50 bg-amber-500/[0.04] hover:border-amber-500/80 shadow-sm'
              : 'border-border/40 hover:border-primary/40'
          )}
        >
          {/* 拖拽手柄图标 */}
          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab text-muted-foreground">
            <GripVertical className="h-3.5 w-3.5" />
          </div>

          {/* 图标与单卡片重抓按钮 */}
          <div className="relative flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden transition-transform duration-300 ease-out group-hover:scale-105 ml-2.5 bg-muted/40 p-1 flex items-center justify-center border border-border/30">
            <SiteFavicon
              title={displayTitle}
              href={item.href}
              icon={item.icon}
              useDefaultIcon={item.useDefaultIcon}
              className="w-full h-full object-contain"
            />
          </div>

          {/* 文字内容 */}
          <div className="flex-1 min-w-0 pr-16">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-[14.5px] text-foreground truncate leading-snug transition-colors duration-200 group-hover:text-primary">
                {displayTitle}
              </h3>
              {item.isCustom && (
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                  {t('自定义', 'Custom')}
                </span>
              )}
              <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0 opacity-0 -translate-x-1 translate-y-0.5 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-primary text-muted-foreground/30" />
            </div>
            {displayDesc && (
              <p className="text-muted-foreground/80 text-[12.5px] leading-relaxed mt-0.5 line-clamp-1">
                {displayDesc}
              </p>
            )}
          </div>

          {/* 常用置顶、编辑、单卡片重抓、收藏与删除按键 */}
          <div className="absolute right-2 top-2.5 flex items-center gap-0.5 bg-card/80 backdrop-blur-sm rounded-lg p-0.5 border border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* 🔄 单卡片独立重新拉取图标 */}
            <button
              type="button"
              onClick={handleSingleCardRefreshIcon}
              title={t('定向重新拉取此工具图标', 'Re-fetch icon for this tool')}
              className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isRefreshingIcon && 'animate-spin text-primary')} />
            </button>

            {/* ✏️ 二次编辑按键（仅自定义工具展示） */}
            {item.isCustom && onEditCustom && (
              <button
                type="button"
                onClick={handleEditClick}
                title={t('二次编辑工具', 'Edit custom tool')}
                className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            )}

            {/* 🗑️ 删除按键（仅自定义工具展示） */}
            {item.isCustom && onDeleteCustom && (
              <button
                type="button"
                onClick={handleDeleteClick}
                title={t('删除自定义工具', 'Delete custom tool')}
                className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}

            {/* ❤️ 收藏 */}
            <button
              type="button"
              onClick={handleFavClick}
              title={fav ? t('取消收藏', 'Remove from favorites') : t('收藏此工具', 'Add to favorites')}
              className={cn(
                'p-1 rounded-md transition-all duration-200',
                fav ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' : 'text-muted-foreground hover:text-red-500 hover:bg-muted'
              )}
            >
              <Heart className={cn('h-3.5 w-3.5 transition-transform', fav && 'fill-red-500 text-red-500')} />
            </button>

            {/* 📌 置顶 */}
            <button
              type="button"
              onClick={handlePinClick}
              title={isPinned ? t('取消常用置顶', 'Unpin from top') : t('设为常用置顶', 'Pin to top')}
              className={cn(
                'p-1 rounded-md transition-all duration-200',
                isPinned ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20' : 'text-muted-foreground hover:text-amber-500 hover:bg-muted'
              )}
            >
              <Pin className={cn('h-3.5 w-3.5 transition-transform', isPinned && 'fill-amber-500 rotate-45')} />
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}
