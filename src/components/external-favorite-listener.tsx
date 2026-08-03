'use client'

// 监听来自桌面应用标签栏的"收藏链接"事件
import { useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { favoriteVideo } from '@/lib/favorites'

export function ExternalFavoriteListener() {
  const { toast } = useToast()

  useEffect(() => {
    const api = (window as unknown as { appAPI?: { onFavoriteVideo?: (cb: (data: {
      title: string
      href: string
      description?: string
      icon?: string
      platform?: string
      videoConfig?: unknown
    }) => void) => void } }).appAPI

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
      if (result === 'duplicate') {
        toast({ title: '已收藏', description: '这个链接已经在收藏夹里了' })
      } else {
        toast({ title: '收藏成功', description: '已加入收藏，可在收藏页查看和播放' })
      }
    })
  }, [toast])

  return null
}
