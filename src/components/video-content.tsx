'use client'

import { useState, useMemo, useEffect } from 'react'
import type { NavigationData, NavigationItem, NavigationSubItem } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'
import { NavigationCard } from '@/components/navigation-card'
import { VideoCard } from '@/components/video-card'
import { Sidebar } from '@/components/sidebar'
import { SearchBar } from '@/components/search-bar'
import { ModeToggle } from '@/components/mode-toggle'
import { Footer } from '@/components/footer'
import { Menu, Star, Plus, Sparkles, RefreshCw, X, Trash2, Edit3 } from 'lucide-react'
import { Button } from "@/registry/new-york/ui/button"
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/language-context'
import { WindowControls } from '@/components/window-controls'

interface VideoContentProps {
    navigationData: NavigationData
    siteData: SiteConfig
}

export interface CustomVideoItem extends NavigationSubItem {
    isCustom?: boolean
    categoryId?: string
}

export function VideoContent({ navigationData, siteData }: VideoContentProps) {
    const { locale, t } = useLanguage()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // 自定义视频导航卡片
    const [customVideos, setCustomVideos] = useState<CustomVideoItem[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formUrl, setFormUrl] = useState('')
    const [formTitle, setFormTitle] = useState('')
    const [formDesc, setFormDesc] = useState('')
    const [formCategory, setFormCategory] = useState(navigationData.navigationItems[0]?.id || '0')
    const [isFetchingMeta, setIsFetchingMeta] = useState(false)
    const [toastMessage, setToastMessage] = useState('')

    const showToast = (msg: string) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(''), 2500)
    }

    useEffect(() => {
        try {
            const saved = localStorage.getItem('ai-toolbox-custom-videos')
            if (saved) {
                setCustomVideos(JSON.parse(saved))
            }
        } catch {}
    }, [])

    useEffect(() => {
        const checkWidth = () => setIsMobile(window.innerWidth < 640)
        checkWidth()
        window.addEventListener('resize', checkWidth)
        return () => window.removeEventListener('resize', checkWidth)
    }, [])

    // 自动抓取网站元数据
    const handleAutoFetchMeta = async (inputUrl: string, force = true) => {
        const target = inputUrl.trim()
        if (!target) return
        const fullTarget = target.startsWith('http') ? target : `https://${target}`
        setIsFetchingMeta(true)
        try {
            const api = (window as unknown as { appAPI?: { fetchSiteMeta?: (u: string) => Promise<{ title: string; description: string }> } }).appAPI
            if (api && api.fetchSiteMeta) {
                const meta = await api.fetchSiteMeta(fullTarget)
                if (meta) {
                    if (meta.title && (force || !formTitle)) setFormTitle(meta.title)
                    if (meta.description && (force || !formDesc)) setFormDesc(meta.description)
                    if (force && (meta.title || meta.description)) {
                        showToast(t('✅ 已成功自动抓取视频站点标题与简介！', 'Scraped title & description!'))
                    }
                }
            } else {
                try {
                    const u = new URL(fullTarget)
                    const host = u.hostname.replace(/^www\./, '')
                    const mainName = host.split('.')[0]
                    if (mainName && (force || !formTitle)) {
                        setFormTitle(mainName.charAt(0).toUpperCase() + mainName.slice(1))
                    }
                } catch {}
            }
        } catch {
        } finally {
            setIsFetchingMeta(false)
        }
    }

    const handleOpenAdd = (catId?: string) => {
        setEditingId(null)
        setFormUrl('')
        setFormTitle('')
        setFormDesc('')
        setFormCategory(catId || navigationData.navigationItems[0]?.id || '0')
        setShowAddModal(true)
    }

    const handleOpenEdit = (item: CustomVideoItem) => {
        setEditingId(item.id)
        setFormUrl(item.href)
        setFormTitle(item.title)
        setFormDesc(item.description || '')
        setFormCategory(item.categoryId || navigationData.navigationItems[0]?.id || '0')
        setShowAddModal(true)
    }

    const handleSaveVideo = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formUrl.trim() || !formTitle.trim()) {
            showToast(t('请填写网址与名称', 'Please fill URL and title'))
            return
        }

        const fullUrl = formUrl.startsWith('http') ? formUrl.trim() : `https://${formUrl.trim()}`

        if (editingId) {
            const next = customVideos.map((v) => {
                if (v.id === editingId) {
                    return {
                        ...v,
                        title: formTitle.trim(),
                        titleEn: formTitle.trim(),
                        href: fullUrl,
                        description: formDesc.trim(),
                        descriptionEn: formDesc.trim(),
                        categoryId: formCategory,
                    }
                }
                return v
            })
            setCustomVideos(next)
            try { localStorage.setItem('ai-toolbox-custom-videos', JSON.stringify(next)) } catch {}
            showToast(t(`✅ 已更新视频导航「${formTitle.trim()}」！`, `Updated "${formTitle.trim()}"!`))
        } else {
            const newVideo: CustomVideoItem = {
                id: `custom-video-${Date.now()}`,
                title: formTitle.trim(),
                titleEn: formTitle.trim(),
                href: fullUrl,
                description: formDesc.trim(),
                descriptionEn: formDesc.trim(),
                categoryId: formCategory,
                isCustom: true,
                enabled: true
            }
            const next = [...customVideos, newVideo]
            setCustomVideos(next)
            try { localStorage.setItem('ai-toolbox-custom-videos', JSON.stringify(next)) } catch {}
            showToast(t(`✅ 已成功添加视频导航「${newVideo.title}」！`, `Added "${newVideo.title}"!`))
        }

        setShowAddModal(false)
        setEditingId(null)
    }

    const handleDeleteVideo = (id: string) => {
        const next = customVideos.filter((v) => v.id !== id)
        setCustomVideos(next)
        try { localStorage.setItem('ai-toolbox-custom-videos', JSON.stringify(next)) } catch {}
        showToast(t('已删除自定义视频导航', 'Custom video card deleted'))
    }

    const mergedNavigationData = useMemo(() => {
        return {
            ...navigationData,
            navigationItems: navigationData.navigationItems.map((category) => {
                const catCustom = customVideos.filter((cv) => (cv.categoryId || navigationData.navigationItems[0]?.id) === category.id)
                return {
                    ...category,
                    items: [...(category.items || []), ...catCustom]
                }
            })
        }
    }, [navigationData, customVideos])

    const searchResults = useMemo(() => {
        const query = searchQuery.toLowerCase().trim()
        if (!query) return []

        const results: Array<{
            category: NavigationItem
            items: (NavigationItem | NavigationSubItem)[]
            subCategories: Array<{
                title: string
                items: (NavigationItem | NavigationSubItem)[]
            }>
        }> = []

        mergedNavigationData.navigationItems.forEach(category => {
            const items = (category.items || []).filter(item => {
                if (item.enabled === false) return false
                const titleMatch = item.title.toLowerCase().includes(query)
                const titleEnMatch = item.titleEn?.toLowerCase().includes(query) || false
                const descMatch = item.description?.toLowerCase().includes(query) || false
                const descEnMatch = item.descriptionEn?.toLowerCase().includes(query) || false
                return titleMatch || titleEnMatch || descMatch || descEnMatch
            })

            const subResults: Array<{
                title: string
                items: (NavigationItem | NavigationSubItem)[]
            }> = []

            if (category.subCategories) {
                category.subCategories.forEach(sub => {
                    if (sub.enabled === false) return
                    const subItems = (sub.items || []).filter(item => {
                        if (item.enabled === false) return false
                        const titleMatch = item.title.toLowerCase().includes(query)
                        const titleEnMatch = item.titleEn?.toLowerCase().includes(query) || false
                        const descMatch = item.description?.toLowerCase().includes(query) || false
                        const descEnMatch = item.descriptionEn?.toLowerCase().includes(query) || false
                        return titleMatch || titleEnMatch || descMatch || descEnMatch
                    })

                    if (subItems.length > 0) {
                        subResults.push({
                            title: sub.title,
                            items: subItems
                        })
                    }
                })
            }

            if (items.length > 0 || subResults.length > 0) {
                results.push({
                    category,
                    items,
                    subCategories: subResults
                })
            }
        })

        return results
    }, [mergedNavigationData, searchQuery])

    const handleSearch = (query: string) => {
        setSearchQuery(query)
    }

    return (
        <div className="flex flex-col sm:flex-row min-h-screen bg-background relative">
            {/* 全局反馈 Toast */}
            {toastMessage && (
                <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[110] px-4 py-2 bg-foreground text-background text-xs font-semibold rounded-full shadow-lg border border-border/20 animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-none">
                    {toastMessage}
                </div>
            )}

            {/* 新增/编辑弹窗 */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowAddModal(false)}>
                    <div
                        className="w-full max-w-md bg-card border border-border/70 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 select-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-border/40 pb-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <h3 className="text-base font-bold text-foreground">
                                    {editingId ? t('编辑视频导航卡片', 'Edit Video Card') : t('添加自定义视频导航', 'Add Video Card')}
                                </h3>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveVideo} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-foreground mb-1 block">
                                    {t('视频 / 频道 / 平台网址', 'URL')} *
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        required
                                        placeholder="https://..."
                                        value={formUrl}
                                        onChange={(e) => setFormUrl(e.target.value)}
                                        onBlur={() => { if (formUrl && (!formTitle || !formDesc)) handleAutoFetchMeta(formUrl, false) }}
                                        className="flex-1 px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border/60 focus:outline-hidden focus:ring-1 focus:ring-primary"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={!formUrl.trim() || isFetchingMeta}
                                        onClick={() => handleAutoFetchMeta(formUrl, true)}
                                        className="h-8 text-xs gap-1 flex-shrink-0"
                                    >
                                        <RefreshCw className={`h-3 w-3 ${isFetchingMeta ? 'animate-spin' : ''}`} />
                                        <span>{isFetchingMeta ? t('抓取中...', 'Fetching...') : t('智能抓取', 'Auto Fetch')}</span>
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-foreground mb-1 block">
                                    {t('视频/平台名称', 'Name')} *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder={t('如：Runway Gen-3 AI视频', 'e.g. Runway Gen-3')}
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border/60 focus:outline-hidden focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-foreground mb-1 block">
                                    {t('视频/平台简介', 'Description')}
                                </label>
                                <input
                                    type="text"
                                    placeholder={t('如：全球顶尖的下一代生成式视频创作工具', 'e.g. Next-generation AI video generator')}
                                    value={formDesc}
                                    onChange={(e) => setFormDesc(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border/60 focus:outline-hidden focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-foreground mb-1 block">
                                    {t('所属分类', 'Category')}
                                </label>
                                <select
                                    value={formCategory}
                                    onChange={(e) => setFormCategory(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border/60 focus:outline-hidden focus:ring-1 focus:ring-primary"
                                >
                                    {navigationData.navigationItems.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {locale === 'en' && cat.titleEn ? cat.titleEn : cat.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddModal(false)} className="h-8 text-xs">
                                    {t('取消', 'Cancel')}
                                </Button>
                                <Button type="submit" size="sm" className="h-8 text-xs gap-1 bg-primary text-primary-foreground">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>{editingId ? t('保存修改', 'Save Changes') : t('立即添加', 'Add Video')}</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ display: isMobile ? "none" : "block" }}>
                <Sidebar
                    navigationData={mergedNavigationData}
                    siteInfo={siteData}
                    className="sticky top-0 h-screen"
                />
            </div>

            <div
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all"
                style={{ display: isMobile ? "block" : "none", opacity: isSidebarOpen ? 1 : 0, pointerEvents: isSidebarOpen ? "auto" : "none" }}
            >
                <div
                    className="fixed inset-y-0 right-0 w-3/4 max-w-xs bg-background shadow-2xl transform transition-transform duration-300 ease-out"
                    style={{ transform: isSidebarOpen ? "translateX(0)" : "translateX(100%)" }}
                >
                    <Sidebar
                        navigationData={mergedNavigationData}
                        siteInfo={siteData}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                </div>
            </div>

            <main className="flex-1 min-w-0">
                <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/40">
                    <div className="flex items-center gap-4 px-5 sm:px-10 h-14">
                        <div className="flex-1 min-w-0">
                            <SearchBar
                                navigationData={mergedNavigationData}
                                onSearch={handleSearch}
                                searchResults={searchResults}
                                searchQuery={searchQuery}
                                siteConfig={siteData}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenAdd()}
                                className="h-8 text-xs gap-1.5 border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-medium"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>{t('添加视频', 'Add Video')}</span>
                            </Button>
                            <div className="w-[1px] h-4 bg-border/60 mx-0.5" />
                            <ModeToggle />
                            <Link href="/favorites" aria-label={t('我的收藏', 'Favorites')}>
                                <Button variant="ghost" size="icon" className="hover:bg-accent/50 h-8 w-8">
                                    <Star className="h-[17px] w-[17px]" />
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="sm:hidden hover:bg-accent/50 h-8 w-8"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                            <WindowControls />
                        </div>
                    </div>
                </header>

                <div className="px-5 sm:px-10 pt-10 pb-8">
                    <div className="max-w-5xl mx-auto">
                        <section className="mb-12 sm:mb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl sm:text-[2.5rem] font-bold leading-[1.15] tracking-tight">
                                    {t('视频合集与创作导航', 'Videos & AI Media Studio')}
                                </h1>
                                <p className="mt-2.5 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl">
                                    {t('汇集主流视频平台、创作工具和 AI 视频生成工具，支持添加个人常看频道与创作站点。', 'Mainstream video platforms, creative tools, and AI video generators.')}
                                </p>
                            </div>
                            <Button
                                onClick={() => handleOpenAdd()}
                                className="gap-2 text-xs h-9 bg-primary text-primary-foreground font-semibold shadow-xs flex-shrink-0 self-start sm:self-auto"
                            >
                                <Plus className="h-4 w-4" />
                                <span>{t('➕ 添加自定义视频导航', 'Add Custom Video')}</span>
                            </Button>
                        </section>

                        <div className="space-y-14 sm:space-y-20">
                            {mergedNavigationData.navigationItems.map((category) => (
                                <section key={category.id} id={category.id} className="scroll-m-20">
                                    <div className="mb-5 flex items-center justify-between">
                                        <div className="flex items-baseline gap-3">
                                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                                                {locale === 'en' && category.titleEn ? category.titleEn : category.title}
                                            </h2>
                                            {(category.items?.length || 0) > 0 && (
                                                <span className="text-xs text-muted-foreground tabular-nums font-medium">
                                                    {category.items!.length}
                                                </span>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleOpenAdd(category.id)}
                                            className="h-7 text-xs text-muted-foreground hover:text-primary gap-1"
                                        >
                                            <Plus className="h-3 w-3" />
                                            <span>{t('添加到此分类', 'Add here')}</span>
                                        </Button>
                                    </div>
                                    <div className="mt-1 mb-5 feathered-divider" />

                                    {category.items && category.items.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {category.items.map((item, itemIndex) => (
                                                item.videoConfig ? (
                                                    <VideoCard key={item.id} item={item} siteConfig={siteData} />
                                                ) : (
                                                    <div key={item.id} className="relative group">
                                                        <NavigationCard
                                                            item={item}
                                                            siteConfig={siteData}
                                                            featured={itemIndex === 0 && category.items!.length > 3}
                                                        />
                                                        {(item as CustomVideoItem).isCustom && (
                                                            <div className="absolute top-2 right-9 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 backdrop-blur-xs p-0.5 rounded-md border border-border/50 shadow-xs">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.preventDefault()
                                                                        e.stopPropagation()
                                                                        handleOpenEdit(item as CustomVideoItem)
                                                                    }}
                                                                    className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted"
                                                                    title={t('编辑', 'Edit')}
                                                                >
                                                                    <Edit3 className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.preventDefault()
                                                                        e.stopPropagation()
                                                                        handleDeleteVideo(item.id)
                                                                    }}
                                                                    className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                                                    title={t('删除', 'Delete')}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    )}
                                </section>
                            ))}
                        </div>
                    </div>
                </div>

                <Footer siteInfo={siteData} />
            </main>
        </div>
    )
}




