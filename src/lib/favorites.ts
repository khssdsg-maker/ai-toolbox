// 收藏功能 - 使用浏览器 localStorage 存储
import type { VideoConfig } from '@/types/navigation'

export interface FavoriteVideo {
  id: string
  title: string
  href: string
  description?: string
  icon?: string
  videoConfig?: VideoConfig
}

const STORAGE_KEY = 'ai-toolbox-favorites'

// 获取所有收藏
export function getFavorites(): FavoriteVideo[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// 添加收藏
export function addFavorite(item: Omit<FavoriteVideo, 'id'>): FavoriteVideo[] {
  const list = getFavorites()
  const newItem: FavoriteVideo = {
    ...item,
    id: `fav-${Date.now()}`,
  }
  const updated = [newItem, ...list]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

// 删除收藏
export function removeFavorite(id: string): FavoriteVideo[] {
  const updated = getFavorites().filter(item => item.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

// 从 B站链接中解析 videoConfig（支持播放）
export function parseBilibiliUrl(url: string): VideoConfig | undefined {
  const match = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/)
  if (match) {
    return { type: 'bilibili', bvid: match[1] }
  }
  return undefined
}
