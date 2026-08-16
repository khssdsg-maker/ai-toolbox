// 收藏功能 - 使用浏览器 localStorage 存储
import type { VideoConfig } from '@/types/navigation'

export interface FavoriteVideo {
  id: string
  title: string
  href: string
  description?: string
  icon?: string
  platform?: string
  category?: 'ai-tool' | 'video' | 'website'
  videoConfig?: VideoConfig
}

const STORAGE_KEY = 'ai-toolbox-favorites'

// 发送全局更新通知事件
function notifyFavoritesChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ai-toolbox-favorites-updated'))
  }
}

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
    id: `fav-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  }
  const updated = [newItem, ...list]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  notifyFavoritesChanged()
  return updated
}

// 切换收藏状态（存在则删除，不存在则添加）
export function toggleFavorite(item: Omit<FavoriteVideo, 'id'>): boolean {
  const target = normalizeUrl(item.href)
  const list = getFavorites()
  const exists = list.some((f) => normalizeUrl(f.href) === target)

  if (exists) {
    const updated = list.filter((f) => normalizeUrl(f.href) !== target)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    notifyFavoritesChanged()
    return false // 已移除
  } else {
    addFavorite(item)
    return true // 已添加
  }
}

// 收藏视频（自动查重）：返回 added 或 duplicate
export function favoriteVideo(item: Omit<FavoriteVideo, 'id'>): 'added' | 'duplicate' {
  if (isFavorited(item.href)) return 'duplicate'
  addFavorite(item)
  return 'added'
}

// 删除收藏
export function removeFavorite(id: string): FavoriteVideo[] {
  const updated = getFavorites().filter((item) => item.id !== id && normalizeUrl(item.href) !== normalizeUrl(id))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  notifyFavoritesChanged()
  return updated
}

// 导出 JSON
export function exportFavoritesJSON(): string {
  return JSON.stringify(getFavorites(), null, 2)
}

// 导入 JSON
export function importFavoritesJSON(jsonStr: string): number {
  try {
    const parsed = JSON.parse(jsonStr)
    if (!Array.isArray(parsed)) return 0
    const list = getFavorites()
    const seen = new Set(list.map((f) => normalizeUrl(f.href)))
    let addedCount = 0

    for (const item of parsed) {
      if (item && item.href && item.title) {
        const norm = normalizeUrl(item.href)
        if (!seen.has(norm)) {
          seen.add(norm)
          list.unshift({
            id: `fav-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            title: item.title,
            href: item.href,
            description: item.description,
            icon: item.icon,
            platform: item.platform,
            category: item.category || (item.videoConfig ? 'video' : 'website'),
            videoConfig: item.videoConfig,
          })
          addedCount++
        }
      }
    }

    if (addedCount > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      notifyFavoritesChanged()
    }
    return addedCount
  } catch {
    return 0
  }
}

// ============ 视频链接识别 ============

// 一次性迁移：把早期以普通书签形式保存的视频链接升级为可站内播放的视频收藏
// （识别 B站/YouTube 链接，补齐 videoConfig / 分类 / 平台，返回迁移条数）
export function migrateVideoFavorites(): number {
  if (typeof window === 'undefined') return 0
  const list = getFavorites()
  let changed = 0
  for (const f of list) {
    if (f.videoConfig || f.category === 'video') continue
    const parsed = parseVideoUrl(f.href)
    if (!parsed) continue
    f.category = 'video'
    f.platform = parsed.platform
    f.videoConfig = parsed.videoConfig
    if (!f.icon && parsed.cover) f.icon = parsed.cover
    changed++
  }
  if (changed > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }
  return changed
}

// 异步补齐B站视频封面（对缺封面的B站视频收藏调 API 抓取，静默更新）
export async function backfillBilibiliCovers(): Promise<void> {
  if (typeof window === 'undefined') return
  const list = getFavorites()
  const targets = list.filter(
    (f) => f.videoConfig?.type === 'bilibili' && f.videoConfig.bvid && !f.icon
  )
  if (targets.length === 0) return
  let changed = false
  await Promise.all(
    targets.map(async (f) => {
      const cover = await fetchBilibiliCover(f.videoConfig?.bvid || '')
      if (cover) {
        f.icon = cover
        changed = true
      }
    })
  )
  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    notifyFavoritesChanged()
  }
}

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
