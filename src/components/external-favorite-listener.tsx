'use client'

// 监听来自桌面应用标签栏的"收藏链接"事件，保存后把结果回传给标签栏显示
import { useEffect } from 'react'
import { favoriteVideo } from '@/lib/favorites'

export function ExternalFavoriteListener() {
  useEffect(() => {
    const api = (window as unknown as {
      appAPI?: {
        onFavoriteVideo?: (cb: (data: {
          title: string
          href: string
          description?: string
          icon?: string
          platform?: string
          videoConfig?: unknown
        }) => void) => void
        sendFavoriteResult?: (result: { status: string; title: string }) => void
      }
    }).appAPI

    if (!api || !api.onFavoriteVideo) return

    api.onFavoriteVideo((data) => {
      const result = favoriteVideo({
        title: data.title,
        href: data.href,
        description: data.description,
        icon: data.icon,
        platform: data.platform,
        videoConfig: data.videoConfig as never,
      })
      // 结果回传给标签栏显示提示
      if (api.sendFavoriteResult) {
        api.sendFavoriteResult({ status: result, title: data.title })
      }
    })
  }, [])

  return null
}
