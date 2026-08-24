'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface WindowFrameProps {
  children: React.ReactNode
}

export function WindowFrame({ children }: WindowFrameProps) {
  const [isDesktop, setIsDesktop] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const api = (window as unknown as {
      appAPI?: {
        isWindowMaximized?: () => Promise<boolean>
        onMaximizedChange?: (cb: (max: boolean) => void) => void
      }
    }).appAPI

    if (api && api.isWindowMaximized) {
      setIsDesktop(true)
      api.isWindowMaximized().then((max) => {
        if (typeof max === 'boolean') setIsMaximized(max)
      }).catch(() => {})

      api.onMaximizedChange?.((max) => {
        setIsMaximized(max)
      })
    }
  }, [])

  if (!isDesktop) {
    return <>{children}</>
  }

  return (
    <div
      className={cn(
        'w-screen h-screen flex flex-col transition-all duration-150 overflow-hidden relative bg-background text-foreground select-none',
        isMaximized
          ? 'rounded-none border-0'
          : 'rounded-[16px] border border-border/60 shadow-2xl ring-1 ring-black/5 dark:ring-white/10'
      )}
    >
      <div className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden relative flex flex-col">
        {children}
      </div>
    </div>
  )
}
