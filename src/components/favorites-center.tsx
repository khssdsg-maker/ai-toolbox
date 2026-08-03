'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, PlayCircle, Plus, X, MonitorPlay } from 'lucide-react'
import { Button } from '@/registry/new-york/ui/button'
import Link from 'next/link'
import { VideoCard } from '@/components/video-card'
import {
  getFavorites, addFavorite, removeFavorite, parseVideoUrl,
  type FavoriteVideo,
} from '@/lib/favorites'

type MergedFavorite = FavoriteVideo & { _source: 'local' | 'server' }

export function FavoritesCenter() {
  const [favorites, setFavorites] = useState<MergedFavorite[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [mounted, setMounted] = useState(false)

  // 加载收藏：本地 + 桌面应用收藏文件（按链接去重）
  const loadFavorites = useCallback(async () => {
    const local = getFavorites().map((f) => ({ ...f, _source: 'local' as const }))
    let server: MergedFavorite[] = []
    try {
      const res = await fetch('/favorites-data', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          server = data.map((f: FavoriteVideo) => ({ ...f, _source: 'server' as const }))
        }
      }
    } catch {
      // 网页版没有这个接口，忽略
    }
    // 合并去重（相同链接只保留一个）
    const seen = new Set<string>()
    const merged: MergedFavorite[] = []
    for (const f of [...server, ...local]) {
      let key = f.href
      try {
        const u = new URL(f.href)
        key = (u.origin + u.pathname).replace(/\/+$/, '')
      } catch {}
      if (!seen.has(key)) {
        seen.add(key)
        merged.push(f)
      }
    }
    setFavorites(merged)
  }, [])

  useEffect(() => {
    setMounted(true)
    loadFavorites()
  }, [loadFavorites])

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return
    const parsed = parseVideoUrl(url)
    addFavorite({
      title: title.trim(),
      href: url.trim(),
      description: description.trim() || undefined,
      icon: parsed?.cover,
      platform: parsed?.platform,
      videoConfig: parsed?.videoConfig,
    })
    setTitle('')
    setUrl('')
    setDescription('')
    setShowForm(false)
    loadFavorites()
  }

  // 删除收藏：根据来源走不同通道
  const handleRemove = async (fav: MergedFavorite) => {
    if (fav._source === 'server') {
      try {
        await fetch(`/favorites-data?id=${encodeURIComponent(fav.id)}`, { method: 'DELETE' })
      } catch {}
    } else {
      removeFavorite(fav.id)
    }
    loadFavorites()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="flex items-center gap-4 px-5 sm:px-10 h-14 max-w-6xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              首页
            </Button>
          </Link>
          <h1 className="text-lg font-bold tracking-tight">我的收藏</h1>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/videos">
              <Button variant="outline" size="sm" className="gap-1.5">
                <MonitorPlay className="h-4 w-4" />
                跳转视频页
              </Button>
            </Link>
            <Button size="sm" className="gap-1.5" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4" />
              添加视频
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 sm:px-10 py-8">
        {/* 添加视频表单 */}
        {showForm && (
          <form onSubmit={handleAdd} className="mb-8 p-5 rounded-xl bg-card border border-border/40 space-y-4">
            <h2 className="font-bold">添加收藏视频</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="视频标题 *"
                required
                className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm"
              />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="视频链接（支持B站自动识别播放）*"
                required
                className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm"
              />
            </div>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="视频描述（可选）"
              className="w-full h-10 rounded-lg border border-border/60 bg-background px-3 text-sm"
            />
            <div className="flex gap-3">
              <Button type="submit" className="gap-1.5">
                <Plus className="h-4 w-4" />
                保存收藏
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>取消</Button>
            </div>
          </form>
        )}

        {/* 收藏列表 */}
        {mounted && favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {favorites.map((fav) => (
              <div key={fav.id} className="relative group/fav">
                <VideoCard
                  item={{
                    id: fav.id,
                    title: fav.title,
                    href: fav.href,
                    description: fav.description,
                    icon: fav.icon,
                    useDefaultIcon: false,
                    enabled: true,
                    videoConfig: fav.videoConfig,
                  }}
                />
                <button
                  onClick={() => handleRemove(fav)}
                  title="删除收藏"
                  className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/fav:opacity-100 transition-opacity hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : mounted ? (
          <div className="text-center py-20">
            <PlayCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground mb-4">还没有收藏任何视频</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setShowForm(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                添加第一个视频
              </Button>
              <Link href="/videos">
                <Button variant="outline" className="gap-1.5">
                  <MonitorPlay className="h-4 w-4" />
                  去视频页逛逛
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
