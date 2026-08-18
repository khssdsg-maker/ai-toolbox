'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft, Plus, X, MonitorPlay, Search, Download, Upload,
  Sparkles, Globe, Heart, Trash2, ExternalLink
} from 'lucide-react'
import { Button } from '@/registry/new-york/ui/button'
import Link from 'next/link'
import { SiteFavicon } from '@/components/site-favicon'
import { VideoCard } from '@/components/video-card'
import { useLanguage } from '@/lib/language-context'
import { WindowControls } from '@/components/window-controls'
import {
  getFavorites, addFavorite, removeFavorite, parseVideoUrl,
  exportFavoritesJSON, importFavoritesJSON,
  migrateVideoFavorites, backfillBilibiliCovers,
  type FavoriteVideo,
} from '@/lib/favorites'

type MergedFavorite = FavoriteVideo & { _source: 'local' | 'server' }

type CategoryFilter = 'all' | 'ai-tool' | 'video' | 'website'

export function FavoritesCenter() {
  const { t } = useLanguage()
  const [favorites, setFavorites] = useState<MergedFavorite[]>([])
  const [filterTab, setFilterTab] = useState<CategoryFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)

  // 表单状态
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')

  const [mounted, setMounted] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

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
      // 网页版忽略
    }

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
    // 旧收藏迁移：把视频链接书签升级为可站内播放的视频收藏，并异步补齐B站封面
    migrateVideoFavorites()
    loadFavorites()
    backfillBilibiliCovers()

    const updateHandler = () => loadFavorites()
    window.addEventListener('ai-toolbox-favorites-updated', updateHandler)
    return () => window.removeEventListener('ai-toolbox-favorites-updated', updateHandler)
  }, [loadFavorites])

  // 添加收藏
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return

    const parsed = parseVideoUrl(url.trim())
    let cat: 'ai-tool' | 'video' | 'website' = 'website'
    if (parsed) cat = 'video'

    addFavorite({
      title: title.trim(),
      href: url.trim(),
      description: description.trim() || undefined,
      icon: parsed?.cover,
      platform: parsed?.platform,
      category: cat,
      videoConfig: parsed?.videoConfig,
    })

    setTitle('')
    setUrl('')
    setDescription('')
    setShowForm(false)
    loadFavorites()
    showToast(t('添加成功！', 'Added successfully!'))
  }

  // 删除收藏
  const handleRemove = async (fav: MergedFavorite) => {
    if (fav._source === 'server') {
      try {
        await fetch(`/favorites-data?id=${encodeURIComponent(fav.id)}`, { method: 'DELETE' })
      } catch {}
    } else {
      removeFavorite(fav.id)
    }
    loadFavorites()
    showToast(t('已从收藏删除', 'Removed from favorites'))
  }

  // 导出 JSON
  const handleExport = () => {
    const json = exportFavoritesJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `ai-toolbox-favorites-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    showToast(t('收藏已成功导出', 'Favorites exported successfully'))
  }

  // 导入 JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        const count = importFavoritesJSON(content)
        loadFavorites()
        showToast(t(`成功导入 ${count} 条收藏`, `Successfully imported ${count} items`))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // 筛选匹配项目
  const filteredList = favorites.filter((item) => {
    // 分类筛选
    if (filterTab === 'ai-tool' && item.category !== 'ai-tool') return false
    if (filterTab === 'video' && item.category !== 'video' && !item.videoConfig) return false
    if (filterTab === 'website' && (item.category === 'ai-tool' || item.category === 'video' || item.videoConfig)) return false

    // 搜索匹配
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchTitle = item.title.toLowerCase().includes(q)
      const matchDesc = (item.description || '').toLowerCase().includes(q)
      const matchHref = item.href.toLowerCase().includes(q)
      return matchTitle || matchDesc || matchHref
    }
    return true
  })

  // 统计数据
  const countAll = favorites.length
  const countAi = favorites.filter((f) => f.category === 'ai-tool').length
  const countVideo = favorites.filter((f) => f.category === 'video' || f.videoConfig).length
  const countWeb = favorites.filter((f) => f.category !== 'ai-tool' && f.category !== 'video' && !f.videoConfig).length

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      {/* Toast 提醒 */}
      {toastMsg && (
        <div className="fixed top-16 right-6 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-lg text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMsg}
        </div>
      )}

      {/* 顶部导航与快捷操作栏 */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="flex items-center justify-between px-5 sm:px-10 sm:pl-24 h-14 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                {t('首页', 'Home')}
              </Button>
            </Link>
            <div className="h-4 w-[1px] bg-border/60" />
            <h1 className="text-base font-bold flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span>{t('我的个人收藏工作台', 'My Favorites Hub')}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              title={t('导出收藏备份 JSON', 'Export JSON')}
              className="gap-1 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('导出备份', 'Export')}</span>
            </Button>

            <label className="cursor-pointer">
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              <span className="inline-flex items-center gap-1 h-8 px-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-xs font-medium transition-colors">
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('导入备份', 'Import')}</span>
              </span>
            </label>

            <Button size="sm" className="gap-1.5 text-xs ml-1" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4" />
              <span>{t('新增网页书签', 'Add Bookmark')}</span>
            </Button>

            <WindowControls />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 sm:px-10 sm:pl-24 py-6 space-y-6">
        {/* 新增收藏表单面板 */}
        {showForm && (
          <form onSubmit={handleAdd} className="p-5 rounded-2xl bg-card border border-border/60 shadow-lg space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                <span>{t('新增书签/网址收藏', 'Add New Bookmark')}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('网址标题 *', 'Bookmark Title *')}
                required
                className="h-9 rounded-lg border border-border/60 bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t('网页链接 (https://...) *', 'URL (https://...) *')}
                required
                className="h-9 rounded-lg border border-border/60 bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('备注描述（可选）', 'Description (optional)')}
              className="w-full h-9 rounded-lg border border-border/60 bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex gap-2 justify-end pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                {t('取消', 'Cancel')}
              </Button>
              <Button type="submit" size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                {t('确认添加', 'Save Bookmark')}
              </Button>
            </div>
          </form>
        )}

        {/* 控制工具条：分类 Tab 选项卡与搜寻框 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* 分类选项卡 */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/40 overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterTab === 'all' ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t('全部', 'All')} ({countAll})
            </button>
            <button
              onClick={() => setFilterTab('ai-tool')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${filterTab === 'ai-tool' ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>{t('AI 工具', 'AI Tools')}</span> ({countAi})
            </button>
            <button
              onClick={() => setFilterTab('video')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${filterTab === 'video' ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <MonitorPlay className="h-3.5 w-3.5 text-purple-500" />
              <span>{t('视频/媒体', 'Videos')}</span> ({countVideo})
            </button>
            <button
              onClick={() => setFilterTab('website')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${filterTab === 'website' ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Globe className="h-3.5 w-3.5 text-blue-500" />
              <span>{t('自定义书签', 'Bookmarks')}</span> ({countWeb})
            </button>
          </div>

          {/* 实时搜索框 */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('搜索已收藏的工具与书签...', 'Search favorites...')}
              className="w-full h-9 pl-9 pr-7 rounded-xl border border-border/50 bg-card text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 收藏物品列表展示区 */}
        {mounted && filteredList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredList.map((fav) => {
              const isVideo = fav.category === 'video' || !!fav.videoConfig

              if (isVideo) {
                return (
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
                      title={t('删除收藏', 'Delete favorite')}
                      className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/fav:opacity-100 transition-opacity hover:bg-black/80 shadow-md"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                )
              }

              // AI 工具及常规网页卡片渲染
              return (
                <div key={fav.id} className="relative group/card">
                  <a
                    href={fav.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3.5 rounded-xl bg-card border border-border/40 hover:border-border/80 transition-all duration-200 hover:shadow-md h-full flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-muted/30">
                        <SiteFavicon
                          title={fav.title}
                          href={fav.href}
                          icon={fav.icon}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0 pr-5">
                        <div className="flex items-center gap-1">
                          <h3 className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                            {fav.title}
                          </h3>
                          <ExternalLink className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {fav.description && (
                          <p className="text-[11px] text-muted-foreground/80 line-clamp-2 mt-1 leading-relaxed">
                            {fav.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border/20 flex items-center justify-between text-[10px] text-muted-foreground/60">
                      <span className="truncate">
                        {fav.category === 'ai-tool' ? '🤖 AI 工具' : '🌐 网页书签'}
                      </span>
                      <span className="font-mono">
                        {(() => {
                          try {
                            return new URL(fav.href).hostname.replace(/^www\./, '')
                          } catch {
                            return fav.href
                          }
                        })()}
                      </span>
                    </div>
                  </a>

                  {/* 删除按键 */}
                  <button
                    onClick={() => handleRemove(fav)}
                    title={t('删除收藏', 'Delete favorite')}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        ) : mounted ? (
          <div className="text-center py-20 bg-card/40 rounded-2xl border border-dashed border-border/50">
            <Heart className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm font-medium text-foreground mb-1">
              {searchQuery ? t('未找到匹配的收藏项', 'No matching favorites found') : t('我的收藏夹目前为空', 'Your favorites list is empty')}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {searchQuery ? t('请尝试搜索其他关键词', 'Try searching for another keyword') : t('你可以在首页点击任意 AI 工具卡片上的 ❤️ 按钮快速收藏', 'Click ❤️ on any AI tool card on the homepage to save it here')}
            </p>
            {!searchQuery && (
              <div className="flex gap-2 justify-center">
                <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  {t('手动添加网页', 'Add Custom Bookmark')}
                </Button>
                <Link href="/">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    {t('去首页挑选 AI 工具', 'Browse AI Tools')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
