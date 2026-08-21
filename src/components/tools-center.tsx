'use client'

// 网络工具中心：国内直连 + 国际专业网络检测工具 + 自定义网络工具添加
import { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, MonitorPlay, ArrowRightLeft, Star, Globe, Plus, Sparkles, RefreshCw, X, Trash2, Edit3 } from 'lucide-react'
import { Button } from '@/registry/new-york/ui/button'
import Link from 'next/link'
import { NavigationCard } from '@/components/navigation-card'
import type { NavigationSubItem } from '@/types/navigation'
import { useLanguage } from '@/lib/language-context'
import { WindowControls } from '@/components/window-controls'

interface ToolCategory {
  id: string
  title: string
  titleEn: string
  badge?: string
  items: NavigationSubItem[]
}

const TOOLS_DATA: ToolCategory[] = [
  {
    id: 'cn-tools',
    title: '国内直连网络工具',
    titleEn: 'Domestic Network Tools',
    badge: '实测秒级直连 · 站长必备',
    items: [
      { id: 'chinaz', title: '站长工具', titleEn: 'ChinaZ Tools', href: 'https://tool.chinaz.com', description: '老牌综合工具站：Ping、端口扫描、DNS 查询、HTTP 状态检测、编码转换一应俱全。', descriptionEn: 'Classic webmaster suite: Ping, port scan, DNS lookup, HTTP headers.', enabled: true, tags: ['Ping', 'DNS', '端口扫描', 'SEO'] },
      { id: 'itdog', title: 'ITDOG 测速', titleEn: 'ITDOG Speedtest', href: 'https://www.itdog.cn', description: '全国多地 Ping、网站测速、路由追踪、DNS 查询与防火墙检测，国内开发者首选。', descriptionEn: 'Multi-node Ping, speedtest, traceroute and DNS diagnostic tool.', enabled: true, tags: ['多地Ping', '路由追踪', '国内首选'] },
      { id: 'boce', title: 'Boce 波测', titleEn: 'Boce Speed Test', href: 'https://www.boce.com', description: '全国及全球网站测速、HTTP 状态监测、Ping 检测、DNS 解析与 SSL 证书诊断。', descriptionEn: 'Website speed testing, HTTP monitor, and SSL certificate verification.', enabled: true, tags: ['测速', 'SSL检测', 'DNS诊断'] },
      { id: 'ip138', title: 'IP138 查询', titleEn: 'IP138 Lookup', href: 'https://www.ip138.com', description: '老牌高精准 IP 归属地查询，支持手机号归属、身份证号与邮编综合查询。', descriptionEn: 'Accurate IP geolocation, phone carrier, and zipcode database.', enabled: true, tags: ['IP查询', '归属地', '老牌精准'] },
      { id: 'aizhan', title: '爱站工具', titleEn: 'AiZhan SEO Tools', href: 'https://tools.aizhan.com', description: '站长综合工具：百度权重 SEO 查询、IP 反查域名、ICP 备案信息与 Whois 查询。', descriptionEn: 'Comprehensive webmaster tools: SEO ranking, reverse IP, Whois.', enabled: true, tags: ['SEO', 'IP反查', 'ICP备案'] },
      { id: 'ipip', title: 'IPIP.NET 专业查询', titleEn: 'IPIP.NET Database', href: 'https://www.ipip.net', description: '高精度 BGP/IP 地理位置数据库，IP 归属、BGP 路由追踪与全球网络态势地图。', descriptionEn: 'High-precision IP geolocation, BGP traceroute and network topology.', enabled: true, tags: ['高精定位', 'BGP路由', '网络态势'] },
    ]
  },
  {
    id: 'global-tools',
    title: '国际优质诊断服务',
    titleEn: 'Global Network Diagnostics',
    badge: '全球节点分布 · 深度协议分析',
    items: [
      { id: 'mxtoolbox', title: 'MXToolbox 综合诊断', titleEn: 'MXToolbox', href: 'https://mxtoolbox.com', description: '全球权威 DNS、邮件黑名单、HTTP/SSL 综合诊断，支持 100+ 项网络协议深度检测。', descriptionEn: 'Global DNS, blacklist check, and SMTP/HTTP diagnostic suite.', enabled: true, tags: ['DNS权威', '邮件黑名单', 'SSL诊断'] },
      { id: 'dnschecker', title: 'DNSChecker 全球解析', titleEn: 'DNSChecker', href: 'https://dnschecker.org', description: '全球数十个国家节点同时查询 DNS 传播状态，覆盖 A/AAAA/MX/TXT/NS 等全部记录类型。', descriptionEn: 'Global DNS propagation checker covering all DNS record types.', enabled: true, tags: ['DNS传播', '全球节点', '全记录支持'] },
      { id: 'ping-pe', title: 'Ping.pe 全球连通性', titleEn: 'Ping.pe Multi-Ping', href: 'https://ping.pe', description: '全球 30+ 骨干网节点同时执行 Ping / TCP 端口连通性与丢包率实时测试。', descriptionEn: 'Real-time multi-continent Ping and TCP port packet loss analyzer.', enabled: true, tags: ['多大洲节点', 'TCP连通性', '丢包分析'] },
      { id: 'yougetsignal', title: 'YouGetSignal 端口探测', titleEn: 'YouGetSignal Port Check', href: 'https://www.yougetsignal.com/tools/open-ports/', description: '在线快速检测本机或远程服务器指定端口（80/443/22/3389等）开放与防火墙状态。', descriptionEn: 'Fast external port openness and firewall penetration tester.', enabled: true, tags: ['端口探测', '防火墙穿透', '安全检测'] },
    ]
  }
]

export interface CustomNetworkToolItem extends NavigationSubItem {
  isCustom?: boolean
  categoryId?: string
}

export function ToolsCenter() {
  const { locale, t } = useLanguage()
  const [customTools, setCustomTools] = useState<CustomNetworkToolItem[]>([])
  
  // 弹窗与表单状态
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formUrl, setFormUrl] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCategory, setFormCategory] = useState('cn-tools')
  const [isFetchingMeta, setIsFetchingMeta] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2500)
  }

  // 加载自定义网络工具
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai-toolbox-custom-network-tools')
      if (saved) {
        setCustomTools(JSON.parse(saved))
      }
    } catch {}
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
            showToast(t('✅ 已成功自动抓取工具名称与简介！', 'Scraped tool title & description!'))
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
    setFormCategory(catId || 'cn-tools')
    setShowAddModal(true)
  }

  const handleOpenEdit = (item: CustomNetworkToolItem) => {
    setEditingId(item.id)
    setFormUrl(item.href)
    setFormTitle(item.title)
    setFormDesc(item.description || '')
    setFormCategory(item.categoryId || 'cn-tools')
    setShowAddModal(true)
  }

  const handleSaveTool = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formUrl.trim() || !formTitle.trim()) {
      showToast(t('请填写工具名称与网址', 'Please fill name and URL'))
      return
    }

    const fullUrl = formUrl.startsWith('http') ? formUrl.trim() : `https://${formUrl.trim()}`

    if (editingId) {
      const next = customTools.map((c) => {
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
      setCustomTools(next)
      try { localStorage.setItem('ai-toolbox-custom-network-tools', JSON.stringify(next)) } catch {}
      showToast(t(`✅ 已更新工具「${formTitle.trim()}」！`, `Updated tool "${formTitle.trim()}"!`))
    } else {
      const newTool: CustomNetworkToolItem = {
        id: `custom-net-${Date.now()}`,
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
      const next = [...customTools, newTool]
      setCustomTools(next)
      try { localStorage.setItem('ai-toolbox-custom-network-tools', JSON.stringify(next)) } catch {}
      showToast(t(`✅ 已成功添加网络工具「${newTool.title}」！`, `Added tool "${newTool.title}"!`))
    }

    setShowAddModal(false)
    setEditingId(null)
  }

  const handleDeleteTool = (id: string) => {
    const next = customTools.filter((c) => c.id !== id)
    setCustomTools(next)
    try { localStorage.setItem('ai-toolbox-custom-network-tools', JSON.stringify(next)) } catch {}
    showToast(t('已删除自定义网络工具', 'Custom network tool deleted'))
  }

  const mergedCategories = useMemo(() => {
    return TOOLS_DATA.map((cat) => {
      const catCustom = customTools.filter((ct) => (ct.categoryId || 'cn-tools') === cat.id)
      return {
        ...cat,
        items: [...cat.items, ...catCustom]
      }
    })
  }, [customTools])

  return (
    <div className="min-h-screen bg-background relative">
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
                  {editingId ? t('编辑自定义网络工具', 'Edit Custom Tool') : t('添加自定义网络工具', 'Add Custom Tool')}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTool} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  {t('网络工具网址', 'Tool URL')} *
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
                  placeholder={t('如：Speedtest 测速网', 'e.g. Speedtest')}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border/60 focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  {t('工具简介 / 功能说明', 'Description')}
                </label>
                <input
                  type="text"
                  placeholder={t('如：全球宽带与 5G 延迟测速节点', 'e.g. Global broadband & 5G speedtest')}
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
                  {TOOLS_DATA.map((cat) => (
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

      {/* 统一顶栏 */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="flex items-center gap-4 px-5 sm:px-10 sm:pl-24 h-14 max-w-6xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              {t('首页', 'Home')}
            </Button>
          </Link>
          <h1 className="text-lg font-bold tracking-tight">{t('网络工具箱', 'Network Tools')}</h1>
          
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
            <Link href="/convert" aria-label={t('文件转换', 'Convert')}>
              <Button variant="ghost" size="icon" className="hover:bg-accent/50 h-8 w-8">
                <ArrowRightLeft className="h-[17px] w-[17px]" />
              </Button>
            </Link>
            <Link href="/videos" aria-label={t('视频导航', 'Videos')}>
              <Button variant="ghost" size="icon" className="hover:bg-accent/50 h-8 w-8">
                <MonitorPlay className="h-[17px] w-[17px]" />
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

      {/* 主体内容 */}
      <div className="px-5 sm:px-10 sm:pl-24 pt-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <section className="mb-10 sm:mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3 border border-blue-500/20">
                <Globe className="h-3.5 w-3.5" />
                <span>{t('精选国内直连与全球网络诊断', 'Curated Domestic & Global Network Diagnostics')}</span>
              </div>
              <h2 className="text-3xl sm:text-[2.25rem] font-bold leading-[1.15] tracking-tight">
                {t('网络诊断与测速工作台', 'Network Diagnostics Center')}
              </h2>
              <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-xl">
                {t('汇总国内多地 Ping、网站测速、DNS 传播、端口探测与 IP 高精定位工具，支持添加个人网络工具。', 'Ping, multi-region speed test, DNS propagation, port checker, and custom tools.')}
              </p>
            </div>
            <Button
              onClick={() => handleOpenAdd()}
              className="gap-2 text-xs h-9 bg-primary text-primary-foreground font-semibold shadow-xs flex-shrink-0 self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>{t('➕ 添加网络工具', 'Add Network Tool')}</span>
            </Button>
          </section>

          <div className="space-y-12">
            {mergedCategories.map((category) => (
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
                  <div className="mt-3 feathered-divider" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {category.items.map((item) => (
                    <div key={item.id} className="relative group">
                      <NavigationCard item={item} />
                      {(item as CustomNetworkToolItem).isCustom && (
                        <div className="absolute top-2 right-9 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 backdrop-blur-xs p-0.5 rounded-md border border-border/50 shadow-xs">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleOpenEdit(item as CustomNetworkToolItem)
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
                              handleDeleteTool(item.id)
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
        </div>
      </div>
    </div>
  )
}
