'use client'

// 格式转换中心：收录开源离线神器（飞鼠格式等）+ 全能综合旗舰（Convertio 等）+ PDF/知网CAJ + 图像矢量音视频专精
import { useState, useMemo, useEffect } from 'react'
import { ArrowLeft, MonitorPlay, Globe, Star, Search, ShieldCheck, Plus, Sparkles, RefreshCw, X, Trash2, Edit3 } from 'lucide-react'
import { Button } from '@/registry/new-york/ui/button'
import { Input } from '@/registry/new-york/ui/input'
import Link from 'next/link'
import { NavigationCard } from '@/components/navigation-card'
import type { NavigationSubItem } from '@/types/navigation'
import { useLanguage } from '@/lib/language-context'
import { WindowControls } from '@/components/window-controls'

interface ConvertCategory {
  id: string
  title: string
  titleEn: string
  badge?: string
  description?: string
  items: NavigationSubItem[]
}

const CONVERT_DATA: ConvertCategory[] = [
  {
    id: 'offline-open-source',
    title: '开源离线 & 隐私安全神器',
    titleEn: 'Open Source & Offline Tools',
    badge: '100% 离线免联网 · 零隐私泄露',
    description: '无需将私密合同、照片上传到云端，纯本地计算，安全高效',
    items: [
      {
        id: 'flying-mouse-format',
        title: '飞鼠格式转换 (FlyingMouse)',
        titleEn: 'FlyingMouse Format',
        href: 'https://github.com/LaoFeng-mouse/flyingmouse-format',
        description: '开源离线全格式转换神器！内置 FFmpeg + LibreOffice + OCR，支持全格式互转、PDF版式还原与文字提取，无广告不联网。',
        descriptionEn: 'Open-source offline converter with FFmpeg, LibreOffice & OCR. 100% offline, privacy first.',
        enabled: true,
        tags: ['开源离线', '全格式覆盖', 'PDF还原', 'OCR提取']
      },
      {
        id: 'pdf24-tools',
        title: 'PDF24 Tools (德国全免费)',
        titleEn: 'PDF24 Tools',
        href: 'https://tools.pdf24.org/zh/',
        description: '德国老牌完全免费、无限次数无限制的 PDF/文档工具箱，支持 PDF 合并拆分压缩与纯离线桌面版。',
        descriptionEn: '100% free unlimited PDF toolbox with offline desktop creator and web tools.',
        enabled: true,
        tags: ['完全免费', '无限次数', '离线客户端', 'PDF瑞士军刀']
      },
      {
        id: 'squoosh-google',
        title: 'Squoosh (谷歌开源本地压缩)',
        titleEn: 'Squoosh (Google Labs)',
        href: 'https://squoosh.app/',
        description: '谷歌 Chrome 实验室开源纯本地图片极致压缩器，浏览器 WebAssembly 本地即时转 WebP/AVIF，绝不上传服务器。',
        descriptionEn: 'Google Chrome Labs open-source browser image compressor. 100% local WebAssembly.',
        enabled: true,
        tags: ['谷歌开源', '本地压缩', 'WebP/AVIF', '绝对隐私']
      }
    ]
  },
  {
    id: 'all-in-one-flagship',
    title: '全能综合旗舰 (300+ 格式)',
    titleEn: 'All-in-One Converters',
    badge: '文档/表格/图片/音频/视频全支持',
    description: '涵盖全网最知名的全能云端格式转换服务',
    items: [
      {
        id: 'convertio',
        title: 'Convertio (旗舰全能转换)',
        titleEn: 'Convertio',
        href: 'https://convertio.co/zh/',
        description: '支持 300+ 格式全能转换，涵盖文档、图片、音视频、电子书、CAD 与字体的高保真转换神器。',
        descriptionEn: 'Premier converter supporting 300+ formats across documents, audio, video, ebook and CAD.',
        enabled: true,
        tags: ['300+格式', '高保真度', 'CAD支持', '旗舰工具']
      },
      {
        id: 'cloudconvert',
        title: 'CloudConvert (国际标杆)',
        titleEn: 'CloudConvert',
        href: 'https://cloudconvert.com/',
        description: '全球格式转换权威标杆，支持 200+ 格式，音视频编码与复杂文档排版转换保真度极高。',
        descriptionEn: 'The Swiss army knife for file conversions with granular codec and resolution controls.',
        enabled: true,
        tags: ['国际标杆', '精细调参', '200+格式', '超高质量']
      },
      {
        id: 'tinywow',
        title: 'TinyWow (全免费无套路)',
        titleEn: 'TinyWow',
        href: 'https://tinywow.com/',
        description: '全免费无门槛文件与 AI 工具箱，支持各种格式互转，文件处理 1 小时后自动物理销毁保障安全。',
        descriptionEn: 'Free all-in-one utility box with automated 1-hour file purge for maximum privacy.',
        enabled: true,
        tags: ['全免费', '免登录', '1小时销毁', '多合一']
      },
      {
        id: 'freeconvert',
        title: 'FreeConvert (1GB 大文件救星)',
        titleEn: 'FreeConvert',
        href: 'https://www.freeconvert.com/',
        description: '大文件转换利器，免费版支持高达 1GB 单文件上传与批量处理，非常适合大型音视频文件。',
        descriptionEn: 'Handles massive files up to 1GB for free with fast batch processing.',
        enabled: true,
        tags: ['1GB超大文件', '音视频批量', '免费额度足']
      }
    ]
  },
  {
    id: 'pdf-academic',
    title: 'PDF 与学术办公专精',
    titleEn: 'PDF & Academic Document Tools',
    badge: '知网 CAJ 论文直转 · 合同简历排版',
    description: '针对论文、办公合同、学术报告与复杂 PDF 排版的高清转换工具',
    items: [
      {
        id: 'yizhuanhuan-caj',
        title: '易转换 (知网 CAJ 论文直转)',
        titleEn: 'YiZhuanHuan (CAJ to PDF)',
        href: 'https://yizhuanhuan.com/',
        description: '国内学术神器！独家支持中国知网 CAJ 论文免装客户端一键转 PDF/Word，大学生与科研人员刚需。',
        descriptionEn: 'China academic powerhouse for converting CNKI CAJ thesis files directly to PDF/Word.',
        enabled: true,
        tags: ['知网CAJ支持', '论文科研', '免装知网客户端']
      },
      {
        id: 'ilovepdf',
        title: 'iLovePDF (全球 PDF 王者)',
        titleEn: 'iLovePDF',
        href: 'https://www.ilovepdf.com/zh-cn',
        description: '全球第一 PDF 处理平台，PDF 合并、拆分、压缩、转 Word/Excel/PPT、OCR 文字识别排版完美。',
        descriptionEn: 'World leading platform for all PDF operations: merge, split, compress, OCR, convert.',
        enabled: true,
        tags: ['全球第一', 'PDF转Office', 'OCR精准', '版式完美']
      },
      {
        id: 'smallpdf',
        title: 'Smallpdf',
        titleEn: 'Smallpdf',
        href: 'https://smallpdf.com/cn',
        description: '轻巧便捷的高清 PDF 转换与压缩工具，快速处理日常合同与简历。',
        descriptionEn: 'Reliable and sleek PDF conversion suite for everyday documents.',
        enabled: true,
        tags: ['轻巧快捷', '合同简历', '高清压缩']
      }
    ]
  },
  {
    id: 'image-vector-media',
    title: '图像 / 矢量图 / 动图与多媒体',
    titleEn: 'Image, Vector & Media Tools',
    badge: '位图转矢量 SVG · GIF动图切片',
    description: '设计师、视频创作者与自媒体必备的专项多媒体转换',
    items: [
      {
        id: 'ezgif',
        title: 'Ezgif (动图 GIF 制作王者)',
        titleEn: 'Ezgif',
        href: 'https://ezgif.com/',
        description: '动图制作王者！GIF/WebP 帧分解、视频转 GIF、逆向倒放、无损裁剪与尺寸压缩不可替代。',
        descriptionEn: 'The definitive online GIF maker and animated image editor.',
        enabled: true,
        tags: ['GIF王者', '帧分解', '视频转GIF', '逆向倒放']
      },
      {
        id: 'vectorizer-ai',
        title: 'Vectorizer.AI (位图转矢量 SVG)',
        titleEn: 'Vectorizer.AI',
        href: 'https://vectorizer.ai/',
        description: '位图转矢量图神器，将模糊 JPG/PNG 一键逆向追踪生成无限放大不失真的超清 SVG 矢量图。',
        descriptionEn: 'Convert raster images (PNG, JPG) to crisp, scalable full-color SVGs.',
        enabled: true,
        tags: ['转矢量SVG', '无限放大', '几何追踪', '设计师神器']
      },
      {
        id: 'iloveimg',
        title: 'iLoveIMG (批量图像处理)',
        titleEn: 'iLoveIMG',
        href: 'https://www.iloveimg.com/zh-cn',
        description: '批量图片压缩、格式转换、尺寸调整与图片无损放大工具。',
        descriptionEn: 'Effortless bulk image editing, compression, conversion, and upscaling.',
        enabled: true,
        tags: ['批量图片', '无损压缩', '多图批处理']
      },
      {
        id: 'aconvert',
        title: 'Aconvert (经典音视频与文档)',
        titleEn: 'Aconvert',
        href: 'https://www.aconvert.com/cn/',
        description: '经典老牌音视频/文档/电子书/压缩包全能在线转换与切分工具。',
        descriptionEn: 'Veteran conversion utility for audio, video, document, and ebook archives.',
        enabled: true,
        tags: ['老牌扎实', '音视频切分', '电子书格式']
      }
    ]
  }
]

export interface CustomConverterItem extends NavigationSubItem {
  isCustom?: boolean
  categoryId?: string
}

export function ConvertCenter() {
  const { locale, t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [customConverters, setCustomConverters] = useState<CustomConverterItem[]>([])
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formUrl, setFormUrl] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCategory, setFormCategory] = useState('all-in-one-flagship')
  const [isFetchingMeta, setIsFetchingMeta] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2500)
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai-toolbox-custom-converters')
      if (saved) {
        setCustomConverters(JSON.parse(saved))
      }
    } catch {}
  }, [])

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
            showToast(t('✅ 已成功自动抓取网站名称与简介！', 'Scraped site title & description!'))
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
    setFormCategory(catId || 'all-in-one-flagship')
    setShowAddModal(true)
  }

  const handleOpenEdit = (item: CustomConverterItem) => {
    setEditingId(item.id)
    setFormUrl(item.href)
    setFormTitle(item.title)
    setFormDesc(item.description || '')
    setFormCategory(item.categoryId || 'all-in-one-flagship')
    setShowAddModal(true)
  }

  const handleSaveConverter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formUrl.trim() || !formTitle.trim()) {
      showToast(t('请填写工具名称与网址', 'Please fill name and URL'))
      return
    }

    const fullUrl = formUrl.startsWith('http') ? formUrl.trim() : `https://${formUrl.trim()}`

    if (editingId) {
      const next = customConverters.map((c) => {
        if (c.id === editingId) {
          return {
            ...c,
            title: formTitle.trim(),
            titleEn: formTitle.trim(),
            href: fullUrl,
            description: formDesc.trim(),
            descriptionEn: formDesc.trim(),
            categoryId: formCategory,
          }
        }
        return c
      })
      setCustomConverters(next)
      try { localStorage.setItem('ai-toolbox-custom-converters', JSON.stringify(next)) } catch {}
      showToast(t(`✅ 已更新转换工具「${formTitle.trim()}」！`, `Updated tool "${formTitle.trim()}"!`))
    } else {
      const newTool: CustomConverterItem = {
        id: `custom-convert-${Date.now()}`,
        title: formTitle.trim(),
        titleEn: formTitle.trim(),
        href: fullUrl,
        description: formDesc.trim(),
        descriptionEn: formDesc.trim(),
        categoryId: formCategory,
        isCustom: true,
        enabled: true,
        tags: [t('自定义', 'Custom')]
      }
      const next = [...customConverters, newTool]
      setCustomConverters(next)
      try { localStorage.setItem('ai-toolbox-custom-converters', JSON.stringify(next)) } catch {}
      showToast(t(`✅ 已成功添加转换工具「${newTool.title}」！`, `Added converter "${newTool.title}"!`))
    }

    setShowAddModal(false)
    setEditingId(null)
  }

  const handleDeleteConverter = (id: string) => {
    const next = customConverters.filter((c) => c.id !== id)
    setCustomConverters(next)
    try { localStorage.setItem('ai-toolbox-custom-converters', JSON.stringify(next)) } catch {}
    showToast(t('已删除自定义转换工具', 'Custom converter deleted'))
  }

  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    
    const merged = CONVERT_DATA.map((cat) => {
      const catCustom = customConverters.filter((cc) => (cc.categoryId || 'all-in-one-flagship') === cat.id)
      return {
        ...cat,
        items: [...cat.items, ...catCustom]
      }
    })

    return merged.map(category => {
      if (activeCategory !== 'all' && category.id !== activeCategory) {
        return { ...category, items: [] }
      }

      if (!query) return category

      const matchingItems = category.items.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(query)
        const titleEnMatch = item.titleEn?.toLowerCase().includes(query)
        const descMatch = item.description?.toLowerCase().includes(query)
        const descEnMatch = item.descriptionEn?.toLowerCase().includes(query)
        const tagMatch = item.tags?.some(tag => tag.toLowerCase().includes(query))
        
        return titleMatch || titleEnMatch || descMatch || descEnMatch || tagMatch
      })

      return {
        ...category,
        items: matchingItems
      }
    }).filter(category => category.items.length > 0)
  }, [searchQuery, activeCategory, customConverters])

  const totalToolsCount = useMemo(() => {
    return CONVERT_DATA.reduce((acc, cat) => acc + cat.items.length, 0) + customConverters.length
  }, [customConverters])

  return (
    <div className="min-h-screen bg-background relative">
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[110] px-4 py-2 bg-foreground text-background text-xs font-semibold rounded-full shadow-lg border border-border/20 animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-none">
          {toastMessage}
        </div>
      )}

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
                  {editingId ? t('编辑自定义转换工具', 'Edit Custom Converter') : t('添加自定义转换工具', 'Add Custom Converter')}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConverter} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  {t('转换工具网址', 'Tool URL')} *
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
                  {t('工具名称', 'Tool Name')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('如：HandBrake 视频转码', 'e.g. HandBrake')}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border/60 focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  {t('工具简介 / 支持格式', 'Description')}
                </label>
                <input
                  type="text"
                  placeholder={t('如：开源免费强大的视频格式转换与压制工具', 'e.g. Open source video transcoder')}
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
                  {CONVERT_DATA.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {locale === 'en' ? cat.titleEn : cat.title}
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
                  <span>{editingId ? t('保存修改', 'Save Changes') : t('立即添加', 'Add Tool')}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="flex items-center gap-4 px-5 sm:px-10 sm:pl-24 h-14 max-w-6xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              {t('首页', 'Home')}
            </Button>
          </Link>
          <h1 className="text-lg font-bold tracking-tight">{t('格式转换中心', 'Format Converter Center')}</h1>
          
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenAdd()}
              className="h-8 text-xs gap-1.5 border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-medium"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t('添加工具', 'Add Tool')}</span>
            </Button>
            <div className="w-[1px] h-4 bg-border/60 mx-0.5" />
            <Link href="/drivers" aria-label={t('驱动中心', 'Drivers')}>
              <Button variant="ghost" size="icon" className="hover:bg-accent/50 h-8 w-8">
                <MonitorPlay className="h-[17px] w-[17px]" />
              </Button>
            </Link>
            <Link href="/tools" aria-label={t('网络工具箱', 'Network Tools')}>
              <Button variant="ghost" size="icon" className="hover:bg-accent/50 h-8 w-8">
                <Globe className="h-[17px] w-[17px]" />
              </Button>
            </Link>
            <Link href="/favorites" aria-label={t('我的收藏', 'Favorites')}>
              <Button variant="ghost" size="icon" className="hover:bg-accent/50 h-8 w-8">
                <Star className="h-[17px] w-[17px]" />
              </Button>
            </Link>
            <div className="w-[1px] h-4 bg-border/60 mx-0.5" />
            <WindowControls />
          </div>
        </div>
      </header>

      <div className="px-5 sm:px-10 sm:pl-24 pt-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <section className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/20">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{t('精选开源离线 + 旗舰高保真工具库', 'Curated Offline & Flagship Format Converters')}</span>
                </div>
                <h2 className="text-3xl sm:text-[2.25rem] font-bold leading-[1.15] tracking-tight">
                  {t('格式转换导航工作台', 'Format Converter Studio')}
                </h2>
                <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-xl">
                  {t('汇集飞鼠格式离线神器、知网CAJ论文直转、Convertio 与谷歌本地图像压缩，支持添加个人私域转换工具。', 'Curated open-source offline converters, CNKI CAJ thesis converters, and custom converters.')}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('搜索格式: caj, pdf, webp, svg...', 'Search: caj, pdf, webp, svg...')}
                    className="pl-9 pr-4 h-10 bg-background/50 border-border/60 rounded-xl focus-visible:ring-emerald-500/30"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <Button
                  onClick={() => handleOpenAdd()}
                  className="gap-1.5 text-xs h-10 bg-primary text-primary-foreground font-semibold shadow-xs flex-shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('添加工具', 'Add Tool')}</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {t('全部工具', 'All Tools')} ({totalToolsCount})
              </button>
              {CONVERT_DATA.map(cat => {
                const count = cat.items.length + customConverters.filter(c => (c.categoryId || 'all-in-one-flagship') === cat.id).length
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      activeCategory === cat.id
                        ? 'bg-foreground text-background shadow-sm'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {locale === 'en' ? cat.titleEn : cat.title} ({count})
                  </button>
                )
              })}
            </div>
          </section>

          {filteredCategories.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border/60 rounded-2xl">
              <p className="text-muted-foreground text-sm">
                {t('未找到匹配的转换工具，尝试搜索其它格式名称', 'No matching conversion tools found. Try searching another format.')}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="mt-4"
              >
                {t('重置搜索条件', 'Reset Filters')}
              </Button>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredCategories.map((category) => (
                <section key={category.id} id={category.id} className="scroll-m-20">
                  <div className="mb-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="flex items-baseline gap-3">
                        <h3 className="text-xl font-bold tracking-tight">
                          {locale === 'en' ? category.titleEn : category.title}
                        </h3>
                        <span className="text-xs text-muted-foreground tabular-nums font-medium">
                          {category.items.length} {t('款', 'tools')}
                        </span>
                      </div>
                      {category.badge && (
                        <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-0.5 rounded-md hidden sm:inline-block">
                          {category.badge}
                        </span>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-xs text-muted-foreground/80 mt-1">
                        {category.description}
                      </p>
                    )}
                    <div className="mt-3 feathered-divider" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {category.items.map((item) => (
                      <div key={item.id} className="relative group">
                        <NavigationCard item={item} />
                        {(item as CustomConverterItem).isCustom && (
                          <div className="absolute top-2 right-9 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 backdrop-blur-xs p-0.5 rounded-md border border-border/50 shadow-xs">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleOpenEdit(item as CustomConverterItem)
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
                                handleDeleteConverter(item.id)
                              }}
                              className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                              title={t('删除', 'Delete')}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
