'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/registry/new-york/ui/button'
import { ScrollArea } from '@/registry/new-york/ui/scroll-area'
import type { NavigationData } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'
import * as LucideIcons from 'lucide-react'
import { ChevronDown, ChevronRight, X, Settings, Home, MonitorPlay, ArrowRightLeft, Globe, HardDrive, Star, Sparkles, Columns2 } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { SettingsDialog } from '@/components/settings-dialog'
import { LanguageToggle } from '@/components/language-toggle'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  navigationData: NavigationData
  siteInfo: SiteConfig
  onClose?: () => void
}

export function Sidebar({ className, navigationData, siteInfo, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { locale, t } = useLanguage()
  const [showSettings, setShowSettings] = useState(false)

  // 功能模块入口（独立页面，不与 AI 工具分类混在一起）
  const moduleLinks = [
    { href: '/', label: t('AI 工具导航', 'AI Tools'), icon: Home },
    { href: '/arena', label: t('AI分屏对比', 'AI Arena'), icon: Columns2 },
    { href: '/prompts', label: t('提示词宝典', 'Prompts Hub'), icon: Sparkles },
    { href: '/videos', label: t('视频合集', 'Videos'), icon: MonitorPlay },
    { href: '/convert', label: t('文件转换', 'Convert'), icon: ArrowRightLeft },
    { href: '/tools', label: t('网络工具箱', 'Network Tools'), icon: Globe },
    { href: '/drivers', label: t('驱动中心', 'Drivers'), icon: HardDrive },
    { href: '/favorites', label: t('我的收藏', 'Favorites'), icon: Star },
  ]

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      onClose?.()
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    // 先跳转到对应区域
    scrollToSection(categoryId)

    // 如果有子分类，切换展开/收起状态
    const category = navigationData.navigationItems.find(cat => cat.id === categoryId)
    if (category?.subCategories && category.subCategories.length > 0) {
      toggleCategory(categoryId)
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
    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName] || LucideIcons.Folder;
    return <IconComponent className="h-4 w-4" />;
  }

  // 使用对象存储每个分类的展开状态
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

  // 判断当前路径是否匹配（首页精确匹配，其余前缀匹配）
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div className={cn("w-64 bg-background", className)}>
      <div className="flex h-14 items-center px-4">
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

        {/* 移动模式下的关闭按钮 */}
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

      <ScrollArea className="h-[calc(100vh-7rem)] px-3 py-2">
        {/* 功能模块（独立页面入口） */}
        <p className="px-3 pt-1 pb-1.5 text-xs font-medium text-muted-foreground/60 tracking-wide">
          {t('功能模块', 'MODULES')}
        </p>
        <div className="space-y-0.5 mb-3">
          {moduleLinks.map((m) => {
            const Icon = m.icon
            const active = isActive(m.href)
            return (
              <Link key={m.href} href={m.href} onClick={() => onClose?.()}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 font-medium cursor-pointer",
                    active
                      ? "text-primary bg-primary/5 hover:bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{m.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>

        <div className="h-px bg-border/40 mx-1 mb-3" />

        {/* AI 工具分类（页面内定位） */}
        <p className="px-3 pb-1.5 text-xs font-medium text-muted-foreground/60 tracking-wide">
          {t('AI 工具分类', 'AI CATEGORIES')}
        </p>
        <div className="space-y-1">
          {navigationData.navigationItems.map((category) => (
            <div key={category.id} className="py-2">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  className="flex-1 justify-start gap-2 font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {renderIcon(category.icon)}
                  <span>{locale === 'en' && category.titleEn ? category.titleEn : category.title}</span>
                </Button>

                {category.subCategories && category.subCategories.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 hover:bg-transparent cursor-pointer"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {expandedCategories[category.id] ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>

              {category.subCategories && category.subCategories.length > 0 && (
                <div
                  className={cn(
                    "grid transition-all duration-200 ease-in-out",
                    expandedCategories[category.id] ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="mt-1 ml-4 space-y-1 overflow-hidden">
                    {category.subCategories.map((subCategory) => (
                      <Button
                        key={subCategory.id}
                        variant="ghost"
                        className="w-full justify-start pl-6 text-sm text-muted-foreground/80 hover:text-foreground cursor-pointer"
                        onClick={() => {
                          scrollToSection(subCategory.id)
                          onClose?.()
                        }}
                      >
                        <span>{subCategory.title}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* 左下角：语言切换 + 设置 */}
      <div className="h-14 flex items-center gap-1 px-3 border-t border-border/40">
        <Button
          variant="ghost"
          className="gap-2 flex-1 justify-start text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="h-4 w-4" />
          <span>{locale === 'en' ? 'Settings' : '设置'}</span>
        </Button>
        <LanguageToggle />
      </div>

      <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
