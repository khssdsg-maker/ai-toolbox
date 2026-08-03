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
      <div className="relative flex items-start gap-4 rounded-xl bg-card border border-border/40 px-4 py-4 transition-all duration-200 ease-out hover:border-border/70 hover:shadow-md">
        {/* 图标 */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg transition-transform duration-300 ease-out group-hover:scale-105">
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
      </div>
    </Link>
  )
}
