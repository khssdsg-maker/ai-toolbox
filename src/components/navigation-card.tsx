'use client'

import Link from 'next/link'
import type { NavigationSubItem } from '@/types/navigation'
import { SiteFavicon } from '@/components/site-favicon'
import type { SiteConfig } from '@/types/site'
import { useLanguage } from '@/lib/language-context'
import { ArrowUpRight } from 'lucide-react'

interface NavigationCardProps {
  item: NavigationSubItem
  siteConfig?: SiteConfig
  featured?: boolean
}

export function NavigationCard({ item, siteConfig, featured = false }: NavigationCardProps) {
  const { locale } = useLanguage()
  const linkTarget = siteConfig?.navigation?.linkTarget || '_blank'

  const displayTitle = locale === 'en' && item.titleEn ? item.titleEn : item.title
  const displayDesc = locale === 'en' && item.descriptionEn ? item.descriptionEn : item.description

  return (
    <Link
      href={item.href}
      target={linkTarget}
      rel="noopener noreferrer"
      className="group block"
      title={displayDesc || displayTitle}
    >
      <div className={`
        relative flex items-start gap-4 rounded-xl px-4 py-4
        transition-all duration-200 ease-out
        border border-transparent
        hover:bg-card hover:border-border/60 hover:shadow-sm
        ${featured ? 'sm:px-5 sm:py-5' : ''}
      `}>
        {/* 图标 */}
        <div className={`
          flex-shrink-0 rounded-lg
          transition-transform duration-300 ease-out
          group-hover:scale-105
          ${featured ? 'w-12 h-12' : 'w-10 h-10'}
        `}>
          <SiteFavicon
            title={displayTitle}
            icon={item.icon}
            useDefaultIcon={item.useDefaultIcon}
            className="w-full h-full object-contain"
          />
        </div>

        {/* 文字 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className={`
              font-semibold text-foreground truncate leading-snug
              transition-colors duration-200
              group-hover:text-primary
              ${featured ? 'text-base sm:text-lg' : 'text-[15px]'}
            `}>
              {displayTitle}
            </h3>
            <ArrowUpRight className="
              w-3.5 h-3.5 flex-shrink-0 text-muted-foreground/30
              transition-all duration-300 ease-out
              opacity-0 -translate-x-1 translate-y-0.5
              group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0
              group-hover:text-primary
            " />
          </div>
          {displayDesc && (
            <p className={`
              text-muted-foreground/80 leading-relaxed mt-0.5
              ${featured ? 'line-clamp-2 text-sm' : 'line-clamp-1 text-[13px]'}
            `}>
              {displayDesc}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
