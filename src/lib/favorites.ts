// 收藏功能 - 使用浏览器 localStorage 存储
import type { VideoConfig } from '@/types/navigation'

export interface FavoriteVideo {
  id: string
  title: string
  href: string
  description?: string
  icon?: string
  platform?: string
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

// URL 归一化（去掉参数和锚点，用于查重）
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    return `${u.origin}${u.pathname}`.replace(/\/+$/, '')
  } catch {
    return url
  }
}

// 检查是否已收藏
export function isFavorited(href: string): boolean {
  const target = normalizeUrl(href)
  return getFavorites().some((f) => normalizeUrl(f.href) === target)
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

// 收藏视频（自动查重）：返回 added 或 duplicate
export function favoriteVideo(item: Omit<FavoriteVideo, 'id'>): 'added' | 'duplicate' {
  if (isFavorited(item.href)) return 'duplicate'
  addFavorite(item)
  return 'added'
}

// 删除收藏
export function removeFavorite(id: string): FavoriteVideo[] {
  const updated = getFavorites().filter((item) => item.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

// ============ 视频链接识别 ============

export interface ParsedVideo {
  platform: string
  videoConfig?: VideoConfig
  cover?: string
}

// 识别视频来源，提取播放信息和封面
export function parseVideoUrl(url: string): ParsedVideo | undefined {
  // B站：/video/BVxxxx
  const bvMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/)
  if (bvMatch) {
    return {
      platform: '哔哩哔哩',
      videoConfig: { type: 'bilibili', bvid: bvMatch[1] },
    }
  }

  // YouTube：watch?v= / youtu.be/ / shorts/ / embed/
  const ytMatch =
    url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/) ||
    url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/) ||
    url.match(/youtube\.com\/(?:shorts|embed)\/([a-zA-Z0-9_-]{6,})/)
  if (ytMatch && /youtube\.com|youtu\.be/.test(url)) {
    return {
      platform: 'YouTube',
      videoConfig: { type: 'youtube', videoId: ytMatch[1] },
      cover: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
    }
  }

  return undefined
}

// 尝试从 B站 API 获取视频封面（失败则返回 undefined）
export async function fetchBilibiliCover(bvid: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
      signal: AbortSignal.timeout(5000),
    })
    const data = await res.json()
    if (data?.code === 0 && data?.data?.pic) {
      return data.data.pic.replace(/^http:/, 'https:')
    }
  } catch {
    // 静默失败，封面可选
  }
  return undefined
}

// 尝试从 B站 API 获取视频标题
export async function fetchBilibiliTitle(bvid: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
      signal: AbortSignal.timeout(5000),
    })
    const data = await res.json()
    if (data?.code === 0 && data?.data?.title) {
      return data.data.title
    }
  } catch {
    // 静默失败
  }
  return undefined
}
