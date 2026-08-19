'use client'

import { useState, useEffect } from 'react'
import { Minus, Square, Copy, X, RefreshCw, Sparkles } from 'lucide-react'

export function WindowControls() {
  const [isDesktop, setIsDesktop] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const api = (window as unknown as {
      appAPI?: {
        windowMinimize?: () => void
        windowMaximize?: () => void
        windowClose?: () => void
        isWindowMaximized?: () => Promise<boolean>
      }
    }).appAPI

    if (api && api.windowMinimize) {
      setIsDesktop(true)
      // Check initial maximized state if available
      api.isWindowMaximized?.().then((max) => {
        if (typeof max === 'boolean') setIsMaximized(max)
      }).catch(() => {})
    }
  }, [])

  if (!isDesktop) return null

  const handleMinimize = () => {
    const api = (window as unknown as { appAPI?: { windowMinimize?: () => void } }).appAPI
    api?.windowMinimize?.()
  }

  const handleMaximize = () => {
    const api = (window as unknown as { appAPI?: { windowMaximize?: () => void } }).appAPI
    api?.windowMaximize?.()
    setIsMaximized((prev) => !prev)
  }

  const handleClose = () => {
    const api = (window as unknown as { appAPI?: { windowClose?: () => void } }).appAPI
    api?.windowClose?.()
  }

  const handleRefreshFavicons = () => {
    if (isRefreshing) return
    setIsRefreshing(true)

    // 发起无损智能巡检：仅重新探测当前处于空白/失败状态的卡片，绝不触碰和覆盖正常图标
    window.dispatchEvent(new CustomEvent('ai-toolbox-repair-broken-favicons'))

    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <div
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      className="flex items-center gap-1.5 z-50 relative"
    >
      {/* 🌐 智能巡检与修复空白图标 */}
      <div className="relative">
        <button
          onClick={handleRefreshFavicons}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label="智能修复空白图标"
          className="h-8 px-2.5 rounded-full bg-card/90 hover:bg-primary/10 hover:border-primary/40 border border-border/50 backdrop-blur-md flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-all shadow-sm group"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-primary ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          <span className="hidden md:inline font-medium">
            {isRefreshing ? '正在修复空白...' : '修复空白图标'}
          </span>
        </button>

        {/* 悬浮介绍 Tooltip */}
        {showTooltip && (
          <div className="absolute right-0 top-10 w-64 p-2.5 rounded-xl bg-popover/95 border border-border/80 shadow-2xl text-xs text-foreground z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 pointer-events-none">
            <div className="flex items-center gap-1.5 font-bold text-primary mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>智能巡检与修复空白图标</span>
            </div>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              安全扫描当前页面，仅对显示为空白的异常卡片重新发起多源嗅探修复；已正常显示的官方图标 100% 受到保护，绝不产生误伤。
            </p>
          </div>
        )}
      </div>

      {/* 最小化 */}
      <button
        onClick={handleMinimize}
        title="最小化"
        className="w-8 h-8 rounded-full bg-card/90 hover:bg-muted border border-border/50 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shadow-sm"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      {/* 最大化 / 还原 */}
      <button
        onClick={handleMaximize}
        title={isMaximized ? "向下还原" : "最大化"}
        className="w-8 h-8 rounded-full bg-card/90 hover:bg-muted border border-border/50 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shadow-sm"
      >
        {isMaximized ? (
          <Copy className="w-3.5 h-3.5 rotate-90" />
        ) : (
          <Square className="w-3.5 h-3.5" />
        )}
      </button>

      {/* 关闭 */}
      <button
        onClick={handleClose}
        title="关闭"
        className="w-8 h-8 rounded-full bg-card/90 hover:bg-red-500 hover:text-white border border-border/50 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-white transition-all shadow-sm"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
