'use client'

import { useState, useEffect } from 'react'
import { Minus, X } from 'lucide-react'

export function WindowControls() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const api = (window as unknown as { appAPI?: { windowMinimize?: () => void } }).appAPI
    if (api && api.windowMinimize) setIsDesktop(true)
  }, [])

  if (!isDesktop) return null

  const handleMinimize = () => {
    const api = (window as unknown as { appAPI?: { windowMinimize?: () => void } }).appAPI
    api?.windowMinimize?.()
  }

  const handleClose = () => {
    const api = (window as unknown as { appAPI?: { windowClose?: () => void } }).appAPI
    api?.windowClose?.()
  }

  return (
    <div
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      className="flex items-center gap-2"
    >
      <button
        onClick={handleMinimize}
        title="最小化"
        className="w-8 h-8 rounded-full bg-card/90 hover:bg-muted border border-border/50 backdrop-blur-md flex items-center justify-center text-foreground transition-all shadow-sm"
      >
        <Minus className="w-4 h-4" />
      </button>
      <button
        onClick={handleClose}
        title="关闭"
        className="w-8 h-8 rounded-full bg-card/90 hover:bg-red-500 hover:text-white border border-border/50 backdrop-blur-md flex items-center justify-center text-foreground transition-all shadow-sm"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
