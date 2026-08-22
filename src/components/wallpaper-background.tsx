'use client'

import { useState, useEffect } from 'react'

export interface WallpaperConfig {
  type: 'none' | 'desktop' | 'we' | 'preset' | 'image' | 'video' | 'url'
  url: string
  presetId: string
  maskOpacity: number // 0 ~ 0.9
  bgBlur: number // 0 ~ 30 全屏磨砂纱强度（无极，映射 0~40px backdrop blur）
  glassMode: boolean
  glassOpacity: number // 0.2 ~ 0.9
  glassBlur: number // 0 ~ 24
}

export const WALLPAPER_PRESETS = [
  {
    id: 'aurora-waves',
    name: '极光流体光幕',
    nameEn: 'Aurora Glow',
    preview: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #064e3b 80%, #022c22 100%)',
  },
  {
    id: 'cyber-neon',
    name: '赛博全息星云',
    nameEn: 'Cyber Nebula',
    preview: 'linear-gradient(135deg, #0a0a0f 0%, #2e1065 45%, #701a75 75%, #030712 100%)',
  },
  {
    id: 'deep-space',
    name: '深空暗夜星河',
    nameEn: 'Deep Space',
    preview: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)',
  },
  {
    id: 'sunset-amber',
    name: '炽热落日余晖',
    nameEn: 'Sunset Amber',
    preview: 'linear-gradient(135deg, #1c1917 0%, #7c2d12 40%, #9a3412 70%, #0c0a09 100%)',
  }
]

export const DEFAULT_WALLPAPER_CONFIG: WallpaperConfig = {
  type: 'none',
  url: '',
  presetId: 'aurora-waves',
  maskOpacity: 0.35,
  bgBlur: 0,
  glassMode: false,
  glassOpacity: 0.45,
  glassBlur: 16
}

export function WallpaperBackground() {
  const [config, setConfig] = useState<WallpaperConfig>(DEFAULT_WALLPAPER_CONFIG)
  const [uiTheme, setUiTheme] = useState<string>('default')
  const [mounted, setMounted] = useState(false)

  // 1. 初始化读取本地配置
  useEffect(() => {
    setMounted(true)
    try {
      const savedConfig = localStorage.getItem('ai-toolbox-wallpaper-config')
      if (savedConfig) {
        setConfig({ ...DEFAULT_WALLPAPER_CONFIG, ...JSON.parse(savedConfig) })
      }
      const savedUiTheme = localStorage.getItem('ai-toolbox-ui-theme')
      if (savedUiTheme) {
        setUiTheme(savedUiTheme)
      }
    } catch {}

    // 2. 监听壁纸配置更新事件
    const handleWallpaperChange = (e: Event) => {
      const customEvent = e as CustomEvent<WallpaperConfig>
      if (customEvent.detail) {
        setConfig(customEvent.detail)
      }
    }

    // 3. 监听界面氛围主题更新事件
    const handleUiThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: string }>
      if (customEvent.detail?.theme) {
        setUiTheme(customEvent.detail.theme)
      }
    }

    window.addEventListener('ai-toolbox-wallpaper-change', handleWallpaperChange)
    window.addEventListener('ai-toolbox-ui-theme-change', handleUiThemeChange)
    return () => {
      window.removeEventListener('ai-toolbox-wallpaper-change', handleWallpaperChange)
      window.removeEventListener('ai-toolbox-ui-theme-change', handleUiThemeChange)
    }
  }, [])

  // 4. 同步 DOM 根节点 CSS 变量与 Attribute
  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement

    // 注入界面氛围主题属性
    if (uiTheme && uiTheme !== 'default') {
      root.setAttribute('data-ui-theme', uiTheme)
    } else {
      root.removeAttribute('data-ui-theme')
    }

    // 注入毛玻璃状态与变量（五层层次体系：舞台底 / 侧栏顶栏 / 卡片 / 胶囊岛，随滑杆联动）
    const isGlassActive = config.glassMode || config.type !== 'none'
    if (isGlassActive) {
      const stageOpacity = Math.min(Math.max(config.glassOpacity * 0.62, 0.18), 0.6)
      root.setAttribute('data-glass-mode', 'true')
      root.style.setProperty('--glass-bg-opacity', stageOpacity.toString())
      root.style.setProperty('--glass-chrome-opacity', Math.min(Math.max(config.glassOpacity * 0.55, 0.18), 0.5).toString())
      root.style.setProperty('--glass-card-opacity', Math.min(config.glassOpacity + 0.12, 0.95).toString())
      root.style.setProperty('--glass-island-opacity', Math.min(Math.max(config.glassOpacity * 0.85, 0.3), 0.6).toString())
      root.style.setProperty('--glass-island-blur', `${Math.min(config.glassBlur * 1.75, 40)}px`)
      root.style.setProperty('--glass-blur', `${config.glassBlur}px`)
    } else {
      root.removeAttribute('data-glass-mode')
      root.style.removeProperty('--glass-bg-opacity')
      root.style.removeProperty('--glass-stage-blur')
      root.style.removeProperty('--glass-chrome-opacity')
      root.style.removeProperty('--glass-card-opacity')
      root.style.removeProperty('--glass-island-opacity')
      root.style.removeProperty('--glass-island-blur')
      root.style.removeProperty('--glass-blur')
    }
  }, [config, uiTheme])

  if (!mounted || config.type === 'none') {
    return null
  }

  const selectedPreset = WALLPAPER_PRESETS.find((p) => p.id === config.presetId) || WALLPAPER_PRESETS[0]

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-[-1] select-none transition-opacity duration-700"
    >
      {/* 1. 动态视频壁纸 */}
      {config.type === 'video' && config.url && (
        <video
          key={config.url}
          src={config.url}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      )}

      {/* 2. 静态图片 / 网络 URL 壁纸 */}
      {(config.type === 'image' || config.type === 'url') && config.url && (
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url("${config.url}")` }}
        />
      )}

      {/* 3. 内置精选动态流体光幕预设（半透明光幕纱罩 + 四边羽化，根治窗口两侧辉光断层） */}
      {config.type === 'preset' && (
        <div
          className="relative w-full h-full overflow-hidden transition-all duration-700"
          style={{
            maskImage: 'linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%), linear-gradient(180deg, transparent 0%, black 3%, black 97%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%), linear-gradient(180deg, transparent 0%, black 3%, black 97%, transparent 100%)',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
        >
          {config.presetId === 'aurora-waves' && (
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(6, 13, 23, 0.65)' }}>
              {/* 光球 1: 极光青蓝 */}
              <div
                className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full blur-[100px] opacity-60 mix-blend-screen"
                style={{
                  background: 'radial-gradient(circle, #06b6d4 0%, rgba(6,182,212,0) 70%)',
                  animation: 'orbMove1 18s ease-in-out infinite',
                }}
              />
              {/* 光球 2: 翡翠翠绿 */}
              <div
                className="absolute top-[20%] -right-[15%] w-[60vw] h-[60vw] rounded-full blur-[110px] opacity-50 mix-blend-screen"
                style={{
                  background: 'radial-gradient(circle, #10b981 0%, rgba(16,185,129,0) 70%)',
                  animation: 'orbMove2 22s ease-in-out infinite',
                }}
              />
              {/* 光球 3: 极夜靛蓝 */}
              <div
                className="absolute -bottom-[20%] left-[20%] w-[65vw] h-[65vw] rounded-full blur-[120px] opacity-45 mix-blend-screen"
                style={{
                  background: 'radial-gradient(circle, #6366f1 0%, rgba(99,102,241,0) 70%)',
                  animation: 'orbMove3 26s ease-in-out infinite',
                }}
              />
              {/* 光球 4: 深海墨青 */}
              <div
                className="absolute top-[40%] left-[10%] w-[45vw] h-[45vw] rounded-full blur-[90px] opacity-40 mix-blend-screen"
                style={{
                  background: 'radial-gradient(circle, #0d9488 0%, rgba(13,148,136,0) 70%)',
                  animation: 'orbMove4 20s ease-in-out infinite',
                }}
              />
            </div>
          )}

          {config.presetId === 'cyber-neon' && (
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(9, 5, 20, 0.65)' }}>
              {/* 光球 1: 赛博霓虹紫 */}
              <div
                className="absolute -top-[10%] left-[15%] w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-65 mix-blend-screen"
                style={{
                  background: 'radial-gradient(circle, #a855f7 0%, rgba(168,85,247,0) 70%)',
                  animation: 'orbMove1 16s ease-in-out infinite',
                }}
              />
              {/* 光球 2: 电光绯粉 */}
              <div
                className="absolute -bottom-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full blur-[110px] opacity-55 mix-blend-screen"
                style={{
                  background: 'radial-gradient(circle, #ec4899 0%, rgba(236,72,153,0) 70%)',
                  animation: 'orbMove2 20s ease-in-out infinite',
                }}
              />
              {/* 光球 3: 全息冰蓝 */}
              <div
                className="absolute top-[30%] -right-[15%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-50 mix-blend-screen"
                style={{
                  background: 'radial-gradient(circle, #3b82f6 0%, rgba(59,130,246,0) 70%)',
                  animation: 'orbMove3 24s ease-in-out infinite',
                }}
              />
            </div>
          )}

          {config.presetId === 'deep-space' && (
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(3, 7, 18, 0.65)' }}>
              {/* 光球 1: 深空深蓝 */}
              <div
                className="absolute top-[10%] left-[20%] w-[65vw] h-[65vw] rounded-full blur-[120px] opacity-50 mix-blend-screen"
                style={{
                  background: 'radial-gradient(circle, #1e3a8a 0%, rgba(30,58,138,0) 70%)',
                  animation: 'orbMove1 24s ease-in-out infinite',
                }}
              />
              {/* 光球 2: 幽暗紫夜 */}
              <div
                className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[110px] opacity-45 mix-blend-screen"
                style={{
                  background: 'radial-gradient(circle, #312e81 0%, rgba(49,46,129,0) 70%)',
                  animation: 'orbMove2 28s ease-in-out infinite',
                }}
              />
              {/* 光球 3: 冰星微光 */}
              <div
                className="absolute top-[40%] -right-[10%] w-[50vw] h-[50vw] rounded-full blur-[90px] opacity-35 mix-blend-screen"
                style={{
                  background: 'radial-gradient(circle, #0284c7 0%, rgba(2,132,199,0) 70%)',
                  animation: 'orbMove3 22s ease-in-out infinite',
                }}
              />
            </div>
          )}

          {config.presetId === 'sunset-amber' && (
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(19, 9, 7, 0.65)' }}>
              {/* 光球 1: 耀斑琥珀金 */}
              <div
                className="absolute -top-[15%] left-[10%] w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-60 mix-blend-screen"
                style={{
                  background: 'radial-gradient(circle, #f59e0b 0%, rgba(245,158,11,0) 70%)',
                  animation: 'orbMove1 17s ease-in-out infinite',
                }}
              />
              {/* 光球 2: 熔岩烈橙 */}
              <div
                className="absolute top-[25%] -right-[15%] w-[65vw] h-[65vw] rounded-full blur-[110px] opacity-55 mix-blend-screen"
                style={{
                  background: 'radial-gradient(circle, #ea580c 0%, rgba(234,88,12,0) 70%)',
                  animation: 'orbMove2 21s ease-in-out infinite',
                }}
              />
              {/* 光球 3: 暖暮红霞 */}
              <div
                className="absolute -bottom-[20%] left-[25%] w-[55vw] h-[55vw] rounded-full blur-[120px] opacity-45 mix-blend-screen"
                style={{
                  background: 'radial-gradient(circle, #be123c 0%, rgba(190,18,60,0) 70%)',
                  animation: 'orbMove3 25s ease-in-out infinite',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* 3.5 全屏磨砂纱层：背景高斯模糊滑杆升级为无极磨砂强度（0 全清晰 ~ 40 重磨砂） */}
      {config.type !== 'desktop' && (
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: config.bgBlur > 0 ? `blur(${config.bgBlur * 1.33}px)` : 'none',
            WebkitBackdropFilter: config.bgBlur > 0 ? `blur(${config.bgBlur * 1.33}px)` : 'none',
          }}
        />
      )}

      {/* 4. 遮罩暗化层（图片/视频壁纸减半遮罩提亮；预设光幕与桌面透视实时透出不遮挡） */}
      {(config.type === 'image' || config.type === 'url' || config.type === 'video') && (
        <div
          className="absolute inset-0 bg-black transition-opacity duration-300 pointer-events-none"
          style={{ opacity: config.maskOpacity * 0.5 }}
        />
      )}
    </div>
  )
}
