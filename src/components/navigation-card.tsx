'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { NavigationSubItem } from '@/types/navigation'
import { SiteFavicon } from '@/components/site-favicon'
import type { SiteConfig } from '@/types/site'
import { useLanguage } from '@/lib/language-context'
import { ArrowUpRight, Pin, Heart, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isFavorited, toggleFavorite } from '@/lib/favorites'

interface NavigationCardProps {
  item: NavigationSubItem
  siteConfig?: SiteConfig
  featured?: boolean
  isPinned?: boolean
  onTogglePin?: (id: string) => void
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  isDragging?: boolean
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
}: NavigationCardProps) {
  const { locale, t } = useLanguage()
  const linkTarget = siteConfig?.navigation?.linkTarget || '_blank'

  const displayTitle = locale === 'en' && item.titleEn ? item.titleEn : item.title
  const displayDesc = locale === 'en' && item.descriptionEn ? item.descriptionEn : item.description

  const [fav, setFav] = useState(false)

  useEffect(() => {
    setFav(isFavorited(item.href))
    const updateHandler = () => setFav(isFavorited(item.href))
    window.addEventListener('ai-toolbox-favorites-updated', updateHandler)
    return () => window.removeEventListener('ai-toolbox-favorites-updated', updateHandler)
  }, [item.href])

  const handlePinClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onTogglePin) {
      onTogglePin(item.id)
    }
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

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        'group relative block cursor-grab active:cursor-grabbing select-none transition-all duration-200',
        isDragging && 'opacity-40 scale-[0.98]'
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
            'relative flex items-start gap-3 rounded-xl bg-card border px-3.5 py-3.5 transition-all duration-200 ease-out hover:shadow-md',
            isPinned
              ? 'border-amber-500/50 bg-amber-500/[0.04] hover:border-amber-500/80 shadow-sm'
              : 'border-border/40 hover:border-border/70'
          )}
        >
          {/* 拖拽手柄图标 */}
          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab text-muted-foreground">
            <GripVertical className="h-3.5 w-3.5" />
          </div>

          {/* 图标 */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden transition-transform duration-300 ease-out group-hover:scale-105 ml-2.5">
            <SiteFavicon
              title={displayTitle}
              href={item.href}
              icon={item.icon}
              useDefaultIcon={item.useDefaultIcon}
              className="w-full h-full object-contain"
            />
          </div>

          {/* 文字内容 */}
          <div className="flex-1 min-w-0 pr-12">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-[15px] text-foreground truncate leading-snug transition-colors duration-200 group-hover:text-primary">
                {displayTitle}
              </h3>
              <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0 opacity-0 -translate-x-1 translate-y-0.5 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-primary text-muted-foreground/30" />
            </div>
            {displayDesc && (
              <p className="text-muted-foreground/80 text-[13px] leading-relaxed mt-0.5 line-clamp-1">
                {displayDesc}
              </p>
            )}
          </div>

          {/* 常用置顶与收藏按键 */}
          <div className="absolute right-2 top-2.5 flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleFavClick}
              title={fav ? t('取消收藏', 'Remove from favorites') : t('收藏此工具', 'Add to favorites')}
              className={cn(
                'p-1 rounded-md transition-all duration-200',
                fav
                  ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20'
                  : 'text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-muted'
              )}
            >
              <Heart className={cn('h-3.5 w-3.5 transition-transform', fav && 'fill-red-500 text-red-500')} />
            </button>
            <button
              type="button"
              onClick={handlePinClick}
              title={isPinned ? t('取消常用置顶', 'Unpin from top') : t('设为常用置顶', 'Pin to top')}
              className={cn(
                'p-1 rounded-md transition-all duration-200',
                isPinned
                  ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                  : 'text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-amber-500 hover:bg-muted'
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
