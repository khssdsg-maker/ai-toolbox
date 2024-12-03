"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ReloadIcon } from "@radix-ui/react-icons"

interface AutoRefreshToggleProps {
  onRefresh: () => void
}

export function AutoRefreshToggle({ onRefresh }: AutoRefreshToggleProps) {
  const [state, setState] = useState({
    enabled: false,
    countdown: 30,
    lastRefreshTime: new Date()
  })

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (state.enabled) {
      timer = setInterval(() => {
        setState(prev => {
          if (prev.countdown <= 1) {
            onRefresh()
            return {
              ...prev,
              countdown: 30,
              lastRefreshTime: new Date()
            }
          }
          return {
            ...prev,
            countdown: prev.countdown - 1
          }
        })
      }, 1000)
    } else {
      setState(prev => ({ ...prev, countdown: 30 }))
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [state.enabled, onRefresh])

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="auto-refresh"
          checked={state.enabled}
          onCheckedChange={(enabled) => setState(prev => ({ ...prev, enabled }))}
        />
        <Label htmlFor="auto-refresh">自动刷新</Label>
      </div>
      {state.enabled && (
        <div className="flex items-center text-sm text-muted-foreground">
          <ReloadIcon className="mr-1.5 h-3 w-3 animate-spin" />
          <span>{state.countdown}秒</span>
        </div>
      )}
      <div className="text-sm text-muted-foreground">
        最后更新: {state.lastRefreshTime.toLocaleTimeString()}
      </div>
    </div>
  )
}

