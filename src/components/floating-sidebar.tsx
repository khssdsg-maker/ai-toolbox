'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Home, ArrowRightLeft, Globe, HardDrive, Star, Settings, Sparkles, Columns2, MonitorPlay, Palette } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { SettingsDialog } from '@/components/settings-dialog'

export type CapsuleThemeKey = 'mint' | 'aurora' | 'neon' | 'sunset' | 'sakura' | 'obsidian'

export interface CapsuleThemeOption {
  key: CapsuleThemeKey
  name: string
  nameEn: string
  color: string
  activeClass: string
  desc: string
}

export const CAPSULE_THEMES: CapsuleThemeOption[] = [
  {
    key: 'mint',
    name: '赛博薄荷绿',
    nameEn: 'Cyber Mint',
    color: '#4DE0B1',
    activeClass: 'theme-capsule-mint-active',
    desc: '经典生机荧光，柔和呼吸脉冲光晕'
  },
  {
    key: 'aurora',
    name: '深海极光蓝',
    nameEn: 'Aurora Blue',
    color: '#3B82F6',
    activeClass: 'theme-capsule-aurora-active',
    desc: '极光多色平滑流转，磁吸果冻弹性'
  },
  {
    key: 'neon',
    name: '赛博霓虹紫',
    nameEn: 'Neon Cyber',
    color: '#A855F7',
    activeClass: 'theme-capsule-neon-active',
    desc: '全息光束穿透，高压电光霓虹管弥散'
  },
  {
    key: 'sunset',
    name: '电光落日橙',
    nameEn: 'Sunset Ember',
    color: '#F59E0B',
    activeClass: 'theme-capsule-sunset-active',
    desc: '太阳耀斑熔岩流动，炽热暖阳微粒'
  },
  {
    key: 'sakura',
    name: '樱花绯红粉',
    nameEn: 'Sakura Bloom',
    color: '#EC4899',
    activeClass: 'theme-capsule-sakura-active',
    desc: '果冻水滴挤压形变，花瓣柔光绽放'
  },
  {
    key: 'obsidian',
    name: '黑曜石钛金',
    nameEn: 'Obsidian Pro',
    color: '#334155',
    activeClass: 'theme-capsule-obsidian-active',
    desc: '金属镜面反光拉丝，机械质感脆爽吸附'
  }
]

export function FloatingSidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [showSettings, setShowSettings] = useState(false)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [currentTheme, setCurrentTheme] = useState<CapsuleThemeKey>('mint')

  // 加载并监听胶囊岛主题
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai-toolbox-capsule-theme') as CapsuleThemeKey
      if (saved && CAPSULE_THEMES.some(t => t.key === saved)) {
        setCurrentTheme(saved)
      }
    } catch {}

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: CapsuleThemeKey }>
      if (customEvent.detail?.theme) {
        setCurrentTheme(customEvent.detail.theme)
      }
    }

    window.addEventListener('ai-toolbox-capsule-theme-change', handleThemeChange)
    return () => window.removeEventListener('ai-toolbox-capsule-theme-change', handleThemeChange)
  }, [])

  const handleSelectTheme = (themeKey: CapsuleThemeKey) => {
    setCurrentTheme(themeKey)
    try {
      localStorage.setItem('ai-toolbox-capsule-theme', themeKey)
      window.dispatchEvent(new CustomEvent('ai-toolbox-capsule-theme-change', { detail: { theme: themeKey } }))
    } catch {}
    setShowThemePicker(false)
  }

  const activeThemeObj = CAPSULE_THEMES.find(t => t.key === currentTheme) || CAPSULE_THEMES[0]

  const links = [
    {
      key: 'home',
      href: '/',
      label: t('AI 工具导航', 'AI Tools'),
      desc: t('汇集全球优质 AI 生产力工具，支持自定义分类与自由排版。', 'Curated global AI productivity tools with custom categorization.'),
      icon: Home
    },
    {
      key: 'arena',
      href: '/arena',
      label: t('AI 分屏打擂台', 'AI Arena'),
      desc: t('多大模型同屏竞速对比，内置独立总审官大模型双轮协同研判中枢。', 'Multi-model side-by-side battle with Chief Arbiter dual-round hub.'),
      icon: Columns2
    },
    {
      key: 'prompts',
      href: '/prompts',
      label: t('AI 提示词宝典', 'Prompts Hub'),
      desc: t('覆盖 11 大平台 5 大场景的工业级 Agent 系统提示词与填空生成器。', 'Industrial system prompts & templates for top AI models.'),
      icon: Sparkles
    },
    {
      key: 'videos',
      href: '/videos',
      label: t('视频合集直接看', 'Videos & Player'),
      desc: t('精选优质视频导航，支持 B 站与 YouTube 视频在应用内免广告直接播放。', 'Curated videos with in-app native video playback.'),
      icon: MonitorPlay
    },
    {
      key: 'convert',
      href: '/convert',
      label: t('格式转换导航工作台', 'Format Converter Studio'),
      desc: t('收录飞鼠格式离线神器、知网 CAJ 论文直转、Convertio 与谷歌本地图像压缩等。', 'Curated offline & online format converters including FlyingMouse, CAJ & Convertio.'),
      icon: ArrowRightLeft
    },
    {
      key: 'tools',
      href: '/tools',
      label: t('全网网络工具箱', 'Network Tools'),
      desc: t('IP 归属地查询、网络测速、DNS 探测、Ping 延迟与常用网络排查工具。', 'IP lookup, speed test, DNS probe, Ping & web diagnostic tools.'),
      icon: Globe
    },
    {
      key: 'drivers',
      href: '/drivers',
      label: t('品牌官方驱动中心', 'Driver Center'),
      desc: t('22+ 品牌电脑（联想/戴尔/华硕）与硬件外设（英伟达/AMD）国内官方直连。', 'Official China driver download portals for 22+ PC & GPU brands.'),
      icon: HardDrive
    },
    {
      key: 'favorites',
      href: '/favorites',
      label: t('我的个人收藏', 'My Favorites'),
      desc: t('个人私房工具库与视频书签，支持一键站内播放、导出备份与管理。', 'Personal bookmarks & video library with local backup & playback.'),
      icon: Star
    },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <aside
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="capsule-island fixed left-3 top-1/2 -translate-y-1/2 z-50 hidden sm:flex flex-col items-center gap-2 p-2 rounded-[26px] bg-card/90 backdrop-blur-2xl border border-border/70 shadow-2xl shadow-black/25 select-none"
      >
        {/* 8 大功能模块导航按键 */}
        {links.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const isHovered = hoveredKey === item.key

          return (
            <div
              key={item.key}
              className="relative flex items-center"
              onMouseEnter={() => setHoveredKey(item.key)}
              onMouseLeave={() => setHoveredKey(null)}
            >
              <Link href={item.href} aria-label={item.label}>
                <div
                  className={cn(
                    'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-250 cursor-pointer',
                    active
                      ? activeThemeObj.activeClass
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:scale-105'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </Link>

              {/* 🌟 极致质感的右侧悬浮气泡卡片 (Rich Tooltip) */}
              {isHovered && !showThemePicker && (
                <div className="absolute left-14 top-1/2 -translate-y-1/2 w-64 p-3 rounded-2xl bg-popover/95 border border-border/90 shadow-2xl shadow-black/30 backdrop-blur-2xl z-50 pointer-events-none animate-in fade-in slide-in-from-left-2 duration-150">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-foreground mb-1">
                    <span
                      className="p-1 rounded-lg"
                      style={{ backgroundColor: `${activeThemeObj.color}25`, color: activeThemeObj.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span>{item.label}</span>
                    {active && (
                      <span
                        className="ml-auto text-[9px] px-1.5 py-0.2 rounded-full font-medium"
                        style={{ backgroundColor: `${activeThemeObj.color}25`, color: activeThemeObj.color }}
                      >
                        {t('当前页面', 'Active')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              )}
            </div>
          )
        })}

        <div className="w-6 h-px bg-border/50 my-0.5" />

        {/* 🎨 胶囊岛主题快捷切换按钮 */}
        <div
          className="relative flex items-center"
          onMouseEnter={() => setHoveredKey('theme-btn')}
          onMouseLeave={() => setHoveredKey(null)}
        >
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            aria-label={t('切换胶囊岛主题动画风格', 'Switch Capsule Theme & Animation')}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:scale-105 transition-all cursor-pointer relative"
          >
            <Palette className="w-4 h-4" />
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-card"
              style={{ backgroundColor: activeThemeObj.color }}
            />
          </button>

          {/* 悬浮说明 */}
          {hoveredKey === 'theme-btn' && !showThemePicker && (
            <div className="absolute left-14 top-1/2 -translate-y-1/2 w-56 p-2.5 rounded-2xl bg-popover/95 border border-border/90 shadow-2xl backdrop-blur-2xl z-50 pointer-events-none animate-in fade-in slide-in-from-left-2 duration-150">
              <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-primary" />
                <span>{t('胶囊岛主题动画', 'Capsule Animation Theme')}</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {t('当前: ', 'Current: ')}{activeThemeObj.name}（{activeThemeObj.desc}）
              </p>
            </div>
          )}

          {/* 🌟 6 大主题快速选择弹出面板 */}
          {showThemePicker && (
            <div className="absolute left-14 top-1/2 -translate-y-1/2 w-60 p-3 rounded-2xl bg-card border border-border/90 shadow-2xl shadow-black/35 backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                <span className="font-bold text-xs text-foreground flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>{t('胶囊岛主题与动效', 'Capsule Themes')}</span>
                </span>
                <span className="text-[10px] text-muted-foreground">{CAPSULE_THEMES.length} 款高定</span>
              </div>
              <div className="space-y-1.5">
                {CAPSULE_THEMES.map((th) => {
                  const isSelected = currentTheme === th.key
                  return (
                    <button
                      key={th.key}
                      onClick={() => handleSelectTheme(th.key)}
                      className={cn(
                        'w-full flex items-center gap-2.5 p-1.5 rounded-xl text-left transition-all text-xs cursor-pointer',
                        isSelected ? 'bg-muted border border-border font-semibold' : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: th.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate">{th.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{th.desc}</p>
                      </div>
                      {isSelected && <span className="text-primary text-[11px]">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ⚙️ 系统设置按钮 */}
        <div
          className="relative flex items-center"
          onMouseEnter={() => setHoveredKey('settings')}
          onMouseLeave={() => setHoveredKey(null)}
        >
          <button
            onClick={() => setShowSettings(true)}
            aria-label={t('系统设置', 'Settings')}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:scale-105 transition-all cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </button>

          {hoveredKey === 'settings' && !showThemePicker && (
            <div className="absolute left-14 top-1/2 -translate-y-1/2 w-60 p-3 rounded-2xl bg-popover/95 border border-border/90 shadow-2xl shadow-black/30 backdrop-blur-2xl z-50 pointer-events-none animate-in fade-in slide-in-from-left-2 duration-150">
              <div className="flex items-center gap-1.5 font-bold text-xs text-foreground mb-1">
                <span className="p-1 rounded-lg bg-primary/10 text-primary">
                  <Settings className="w-3.5 h-3.5" />
                </span>
                <span>{t('系统设置', 'System Settings')}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t('主题外观、多语言切换、自定义浏览器与软件更新检测。', 'Theme appearance, languages, custom browser & update checks.')}
              </p>
            </div>
          )}
        </div>
      </aside>

      <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}
