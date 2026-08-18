'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  BookOpen,
  Code,
  Palette,
  Briefcase,
  GraduationCap,
  Star,
  Search,
  Copy,
  Check,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Tag,
  Heart,
  ArrowLeft,
  ExternalLink,
  Globe,
  Compass,
  ArrowUpRight,
  Columns2
} from 'lucide-react'
import { PROMPTS_DATA, PROMPT_CATEGORIES, PROMPT_PLATFORMS, type PromptItem, type PromptPlatform } from '@/data/prompts-data'
import { SiteFavicon } from '@/components/site-favicon'
import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  BookOpen,
  Code,
  Palette,
  Briefcase,
  GraduationCap,
  Star
}

export function PromptsCenter() {
  const { locale, t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // 变量状态缓存：{ [promptId]: { [variableKey]: value } }
  const [variableValues, setVariableValues] = useState<Record<string, Record<string, string>>>({})
  // 展开变量编辑器的 Prompt ID 集合
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})

  // 初始化收藏列表与变量默认值
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem('ai_toolbox_prompt_favs')
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs))
      }
    } catch {}

    const initialVars: Record<string, Record<string, string>> = {}
    const initialExpanded: Record<string, boolean> = {}

    PROMPTS_DATA.forEach((item) => {
      if (item.variables && item.variables.length > 0) {
        initialVars[item.id] = {}
        item.variables.forEach((v) => {
          initialVars[item.id][v.key] = v.defaultValue || ''
        })
        // 默认展开前两个卡片的变量编辑器以便引导用户
        initialExpanded[item.id] = true
      }
    })
    setVariableValues(initialVars)
    setExpandedIds(initialExpanded)
  }, [])

  // 切换收藏状态
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const nextFavs = favorites.includes(id)
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id]
    setFavorites(nextFavs)
    try {
      localStorage.setItem('ai_toolbox_prompt_favs', JSON.stringify(nextFavs))
    } catch {}
  }

  // 获取合成后的 Prompt 最终文本
  const getRenderedPrompt = (item: PromptItem): string => {
    let result = item.prompt
    if (item.variables && item.variables.length > 0) {
      const itemVars = variableValues[item.id] || {}
      item.variables.forEach((v) => {
        const val = itemVars[v.key] !== undefined ? itemVars[v.key] : (v.defaultValue || '')
        result = result.replaceAll(`[${v.key}]`, val || `[${v.label}]`)
      })
    }
    return result
  }

  // 复制 Prompt 到剪贴板
  const handleCopy = (item: PromptItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const textToCopy = getRenderedPrompt(item)
    navigator.clipboard.writeText(textToCopy)
    setCopiedId(item.id)
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  // 修改变量值
  const handleVariableChange = (promptId: string, varKey: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [promptId]: {
        ...(prev[promptId] || {}),
        [varKey]: value
      }
    }))
  }

  // 重置变量为默认值
  const handleResetVariables = (item: PromptItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!item.variables) return
    const defaultVals: Record<string, string> = {}
    item.variables.forEach((v) => {
      defaultVals[v.key] = v.defaultValue || ''
    })
    setVariableValues((prev) => ({
      ...prev,
      [item.id]: defaultVals
    }))
  }

  // 展开/收起变量编辑器
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // 提取所有可用标签
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    PROMPTS_DATA.forEach((item) => {
      if (selectedCategory === 'all' || selectedCategory === item.category || (selectedCategory === 'fav' && favorites.includes(item.id))) {
        item.tags.forEach((tag) => tagSet.add(tag))
      }
    })
    return Array.from(tagSet)
  }, [selectedCategory, favorites])

  // 过滤展示的提示词平台导航
  const filteredPlatforms = useMemo(() => {
    if (!searchQuery.trim()) return PROMPT_PLATFORMS
    const query = searchQuery.toLowerCase().trim()
    return PROMPT_PLATFORMS.filter((p) => {
      return (
        p.name.toLowerCase().includes(query) ||
        p.nameEn.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tag.toLowerCase().includes(query) ||
        p.url.toLowerCase().includes(query)
      )
    })
  }, [searchQuery])

  // 过滤展示的提示词模板列表
  const filteredPrompts = useMemo(() => {
    return PROMPTS_DATA.filter((item) => {
      // 1. 分类过滤
      if (selectedCategory === 'fav') {
        if (!favorites.includes(item.id)) return false
      } else if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false
      }

      // 2. 标签过滤
      if (selectedTag && !item.tags.includes(selectedTag)) {
        return false
      }

      // 3. 搜索过滤
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchTitle = item.title.toLowerCase().includes(query) || item.titleEn.toLowerCase().includes(query)
        const matchDesc = item.description.toLowerCase().includes(query) || item.descriptionEn.toLowerCase().includes(query)
        const matchTags = item.tags.some((tag) => tag.toLowerCase().includes(query))
        const matchContent = item.prompt.toLowerCase().includes(query)
        return matchTitle || matchDesc || matchTags || matchContent
      }

      return true
    })
  }, [selectedCategory, selectedTag, searchQuery, favorites])

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:pl-24 py-6 space-y-7">
      {/* 顶部快捷返回条 */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-card/80 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground border border-border/60 transition-all shadow-sm group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>{t('返回工具箱首页', 'Back to Home')}</span>
        </Link>
      </div>

      {/* 顶部标题横幅 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card/90 to-primary/5 border border-border/60 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {t('AI 提示词灵感宝典', 'AI Prompts Hub')}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {PROMPT_PLATFORMS.length} {t('大主流平台', 'Platforms')} · {PROMPTS_DATA.length} {t('条精选模板', 'Templates')}
              </span>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {t(
                '汇集全球顶级 AI 提示词社区与第三方 Prompt 网站导航，以及实战验证的高分结构化提示词模板。支持参数动态填空与一键秒级复制！',
                'Curated global top AI prompt platforms, communities, and production-ready structured prompt templates with live variable fill-in.'
              )}
            </p>
          </div>

          {/* 实时搜索框 */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('搜索提示词平台、题材或标签...', 'Search platforms, prompts, tags...')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/80 border border-border/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/60 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-muted/60"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 专区一：全球精选 AI 提示词平台导航 (AI Prompt Platforms & Communities) */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Compass className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              {t('🌐 全球热门 AI 提示词平台导航', 'Global AI Prompt Platforms & Libraries')}
            </h2>
            <span className="text-xs text-muted-foreground font-normal">
              （{t('点击卡片直达外部海量 Prompt 社区', 'Click to explore external prompt communities')}）
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {filteredPlatforms.map((platform) => (
            <a
              key={platform.id}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col justify-between p-3.5 rounded-xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-muted/60 flex items-center justify-center">
                      <SiteFavicon title={platform.name} href={platform.url} className="w-full h-full object-contain" />
                    </div>
                    <span className="font-semibold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {locale === 'en' ? platform.nameEn : platform.name}
                    </span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
                </div>

                <p className="text-[12px] text-muted-foreground/85 leading-relaxed line-clamp-2">
                  {locale === 'en' ? platform.descriptionEn : platform.description}
                </p>
              </div>

              <div className="pt-2 mt-2 border-t border-border/40 flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                  {platform.tag}
                </span>
                <span className="text-[11px] text-muted-foreground/60 group-hover:text-primary flex items-center gap-0.5 transition-colors">
                  {t('直达', 'Open')} <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 专区二：精选结构化实战模板 (Curated Built-in Templates with Live Variables) */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              {t('💡 精选结构化实战模板（支持参数填空）', 'Curated Production-Ready Prompt Templates')}
            </h2>
          </div>
        </div>

        {/* 分类 Tabs 选择栏 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PROMPT_CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Sparkles
            const isSelected = selectedCategory === cat.id
            const count =
              cat.id === 'all'
                ? PROMPTS_DATA.length
                : cat.id === 'fav'
                ? favorites.length
                : PROMPTS_DATA.filter((p) => p.category === cat.id).length

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id)
                  setSelectedTag(null)
                }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 border',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]'
                    : 'bg-card/70 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60'
                )}
              >
                <Icon className={cn('w-4 h-4', isSelected ? 'text-primary-foreground' : 'text-primary')} />
                <span>{locale === 'en' ? cat.labelEn : cat.label}</span>
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-md text-[11px] font-semibold',
                    isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* 标签过滤栏 */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1 mr-1 text-[11px]">
              <Tag className="w-3 h-3" />
              {t('标签筛选:', 'Tags:')}
            </span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={cn(
                  'px-2 py-0.5 rounded-lg border text-[11px] transition-all duration-150',
                  selectedTag === tag
                    ? 'bg-primary/15 text-primary border-primary/40 font-medium'
                    : 'bg-card text-muted-foreground hover:text-foreground border-border/40 hover:border-border/80'
                )}
              >
                #{tag}
              </button>
            ))}
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="text-primary hover:underline ml-1 font-medium text-[11px]"
              >
                {t('清除筛选', 'Clear')}
              </button>
            )}
          </div>
        )}

        {/* 提示词卡片列表 */}
        {filteredPrompts.length === 0 ? (
          <div className="text-center py-16 bg-card/40 rounded-2xl border border-dashed border-border/80 space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              {selectedCategory === 'fav'
                ? t('您还没有收藏任何提示词，点击卡片右上角的心形即可收藏！', 'No favorite prompts yet. Click the heart icon to add favorites!')
                : t('未找到匹配的提示词，换个关键词试试吧', 'No matching prompts found. Try a different keyword.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredPrompts.map((item) => {
              const hasVariables = item.variables && item.variables.length > 0
              const isExpanded = expandedIds[item.id] || false
              const isFav = favorites.includes(item.id)
              const isCopied = copiedId === item.id

              return (
                <div
                  key={item.id}
                  className={cn(
                    'group flex flex-col rounded-2xl bg-card border border-border/60 hover:border-border/90 p-5 shadow-sm hover:shadow-md transition-all duration-200 space-y-4 relative'
                  )}
                >
                  {/* 头部标题与操作 */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-foreground leading-snug">
                          {locale === 'en' ? item.titleEn : item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground/90 leading-relaxed">
                        {locale === 'en' ? item.descriptionEn : item.description}
                      </p>
                    </div>

                    {/* 快捷操作区 */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* 收藏按键 */}
                      <button
                        onClick={(e) => toggleFavorite(item.id, e)}
                        title={isFav ? t('取消收藏', 'Remove Favorite') : t('收藏提示词', 'Add to Favorite')}
                        className={cn(
                          'p-2 rounded-xl transition-colors',
                          isFav
                            ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20'
                            : 'text-muted-foreground hover:text-red-500 hover:bg-muted'
                        )}
                      >
                        <Heart className={cn('w-4 h-4', isFav && 'fill-red-500')} />
                      </button>

                      {/* 一键送入分屏对比 */}
                      <Link
                        href={`/arena?prompt=${encodeURIComponent(getRenderedPrompt(item))}`}
                        title={t('将此提示词直接送入双模型分屏对比', 'Send to Arena for Dual Models Comparison')}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all shadow-sm"
                      >
                        <Columns2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t('分屏对比', 'Compare')}</span>
                      </Link>

                      {/* 一键复制按键 */}
                      <button
                        onClick={(e) => handleCopy(item, e)}
                        title={t('复制完整提示词', 'Copy Prompt')}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 shadow-sm',
                          isCopied
                            ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20'
                        )}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{t('已复制 ✓', 'Copied ✓')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t('复制指令', 'Copy Prompt')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 标签列表 */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted/60 text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* 变量填空交互区域 */}
                  {hasVariables && (
                    <div className="rounded-xl bg-muted/40 border border-border/50 p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90 hover:text-primary transition-colors"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                          <span>{t('参数交互填空（自动替换变量）', 'Interactive Variables')}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </button>

                        <button
                          onClick={(e) => handleResetVariables(item, e)}
                          title={t('恢复默认变量', 'Reset to Default')}
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{t('重置', 'Reset')}</span>
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="grid grid-cols-1 gap-2.5 pt-1">
                          {item.variables!.map((v) => {
                            const currentVal = variableValues[item.id]?.[v.key] ?? (v.defaultValue || '')
                            const isMultiline = v.key.includes('code') || v.key.includes('log') || v.key.includes('task') || v.key.includes('abstract')

                            return (
                              <div key={v.key} className="space-y-1">
                                <label className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                                  <span>{v.label}</span>
                                  <code className="text-[10px] text-primary/80 bg-primary/5 px-1 rounded">
                                    [{v.key}]
                                  </code>
                                </label>
                                {isMultiline ? (
                                  <textarea
                                    rows={2}
                                    value={currentVal}
                                    onChange={(e) => handleVariableChange(item.id, v.key, e.target.value)}
                                    placeholder={v.placeholder}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border/70 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-y font-mono"
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={currentVal}
                                    onChange={(e) => handleVariableChange(item.id, v.key, e.target.value)}
                                    placeholder={v.placeholder}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border/70 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                  />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Prompt 实时预览框 */}
                  <div className="relative flex-1">
                    <div className="w-full max-h-48 overflow-y-auto rounded-xl bg-muted/70 dark:bg-zinc-900/80 border border-border/50 p-3 text-xs font-mono text-foreground/90 whitespace-pre-wrap leading-relaxed select-text scrollbar-thin">
                      {getRenderedPrompt(item)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
