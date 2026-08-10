'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Home, ArrowRightLeft, Globe, HardDrive, Star, Settings } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { SettingsDialog } from '@/components/settings-dialog'

export function FloatingSidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [showSettings, setShowSettings] = useState(false)

  const links = [
    { href: '/', label: t('AI 工具', 'AI Tools'), icon: Home },
    { href: '/convert', label: t('格式转换', 'Convert'), icon: ArrowRightLeft },
    { href: '/drivers', label: t('驱动中心', 'Drivers'), icon: HardDrive },
    { href: '/tools', label: t('网络工具', 'Tools'), icon: Globe },
    { href: '/favorites', label: t('我的收藏', 'Favorites'), icon: Star },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <aside className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-center gap-3 p-2 rounded-[24px] bg-card/90 backdrop-blur-xl border border-border/60 shadow-xl shadow-black/10">
        {/* 导航按钮 */}
        {links.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} title={item.label}>
              <div
                className={cn(
                  'w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer',
                  active
                    ? 'bg-[#4DE0B1] text-slate-950 font-bold shadow-md shadow-[#4DE0B1]/30 scale-105'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
            </Link>
          )
        })}

        <div className="w-6 h-px bg-border/50 my-1" />

        {/* 设置按钮 */}
        <button
          onClick={() => setShowSettings(true)}
          title={t('系统设置', 'Settings')}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer"
        >
          <Settings className="w-5 h-5" />
        </button>
      </aside>

      <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}
