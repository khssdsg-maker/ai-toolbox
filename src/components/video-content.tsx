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
import { Menu, Star } from 'lucide-react'
import { Button } from "@/registry/new-york/ui/button"
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/language-context'

interface VideoContentProps {
    navigationData: NavigationData
    siteData: SiteConfig
}

export function VideoContent({ navigationData, siteData }: VideoContentProps) {
    const { locale } = useLanguage()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const checkWidth = () => setIsMobile(window.innerWidth < 640)
        checkWidth()
        window.addEventListener('resize', checkWidth)
        return () => window.removeEventListener('resize', checkWidth)
    }, [])

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

        navigationData.navigationItems.forEach(category => {
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
    }, [navigationData, searchQuery])

    const handleSearch = (query: string) => {
        setSearchQuery(query)
    }

    return (
        <div className="flex flex-col sm:flex-row min-h-screen bg-background">
            <div style={{ display: isMobile ? "none" : "block" }}>
                <Sidebar
                    navigationData={navigationData}
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
                        navigationData={navigationData}
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
                                navigationData={navigationData}
                                onSearch={handleSearch}
                                searchResults={searchResults}
                                searchQuery={searchQuery}
                                siteConfig={siteData}
                            />
                        </div>
                        <div className="flex items-center gap-1">
                            <ModeToggle />
                            <Link href="/favorites" aria-label="我的收藏">
                                <Button variant="ghost" size="icon" className="hover:bg-accent/50">
                                    <Star className="h-[18px] w-[18px]" />
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="sm:hidden hover:bg-accent/50"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="px-5 sm:px-10 pt-10 pb-8">
                    <div className="max-w-5xl mx-auto">
                        <section className="mb-14 sm:mb-20">
                            <h1 className="text-3xl sm:text-[2.5rem] font-bold leading-[1.15] tracking-tight">
                                视频合集
                            </h1>
                            <p className="mt-2.5 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl">
                                汇集主流视频平台、创作工具和 AI 视频生成工具。
                            </p>
                        </section>

                        <div className="space-y-14 sm:space-y-20">
                            {navigationData.navigationItems.map((category) => (
                                <section key={category.id} id={category.id} className="scroll-m-20">
                                    <div className="mb-5">
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
                                        <div className="mt-3 border-b border-border/40" />
                                    </div>

                                    {category.items && category.items.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {category.items.map((item, itemIndex) => (
                                                item.videoConfig ? (
                                                    <VideoCard key={item.id} item={item} siteConfig={siteData} />
                                                ) : (
                                                    <NavigationCard
                                                        key={item.id}
                                                        item={item}
                                                        siteConfig={siteData}
                                                        featured={itemIndex === 0 && category.items!.length > 3}
                                                    />
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




