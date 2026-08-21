'use client'

// 驱动工具中心：品牌官方驱动 + 硬件厂商驱动 + 驱动管理工具 + 自定义驱动添加
import { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, MonitorPlay, ArrowRightLeft, Globe, Star, Plus, Sparkles, RefreshCw, X, Trash2, Edit3 } from 'lucide-react'
import { Button } from '@/registry/new-york/ui/button'
import Link from 'next/link'
import { NavigationCard } from '@/components/navigation-card'
import type { NavigationSubItem } from '@/types/navigation'
import { useLanguage } from '@/lib/language-context'
import { WindowControls } from '@/components/window-controls'

interface DriverCategory {
  id: string
  title: string
  titleEn: string
  items: NavigationSubItem[]
}

const DRIVER_DATA: DriverCategory[] = [
  {
    id: 'brand-drivers',
    title: '品牌电脑驱动',
    titleEn: 'Brand PC Drivers',
    items: [
      { id: 'lenovo', title: '联想驱动', titleEn: 'Lenovo', href: 'https://newsupport.lenovo.com.cn/', description: '联想电脑官方驱动下载与自动检测', descriptionEn: 'Lenovo official driver downloads', enabled: true },
      { id: 'dell', title: '戴尔驱动', titleEn: 'Dell', href: 'https://www.dell.com/support/drivers/zh-cn', description: '戴尔电脑官方驱动和支持', descriptionEn: 'Dell official drivers and support', enabled: true },
      { id: 'hp', title: '惠普驱动', titleEn: 'HP', href: 'https://support.hp.com/cn-zh/drivers', description: '惠普电脑打印机官方驱动下载', descriptionEn: 'HP official driver downloads', enabled: true },
      { id: 'huawei', title: '华为驱动', titleEn: 'Huawei', href: 'https://consumer.huawei.com/cn/support/', description: '华为笔记本官方驱动与支持', descriptionEn: 'Huawei official support', enabled: true },
      { id: 'asus', title: '华硕驱动', titleEn: 'ASUS', href: 'https://www.asus.com.cn/support/', description: '华硕主板显卡笔记本官方驱动', descriptionEn: 'ASUS official support', enabled: true },
      { id: 'acer', title: '宏碁驱动', titleEn: 'Acer', href: 'https://www.acer.com.cn/support.html?type=1', description: '宏碁电脑官方驱动下载', descriptionEn: 'Acer official support', enabled: true },
      { id: 'msi', title: '微星驱动', titleEn: 'MSI', href: 'https://www.msi.cn/support', description: '微星主板显卡笔记本官方驱动', descriptionEn: 'MSI official support', enabled: true },
    ],
  },
  {
    id: 'component-drivers',
    title: '硬件厂商驱动',
    titleEn: 'Component Drivers',
    items: [
      { id: 'nvidia', title: 'NVIDIA 显卡驱动', titleEn: 'NVIDIA', href: 'https://www.nvidia.cn/geforce/drivers/', description: '英伟达显卡官方驱动下载', descriptionEn: 'NVIDIA official drivers', enabled: true },
      { id: 'amd', title: 'AMD 驱动', titleEn: 'AMD', href: 'https://www.amd.com/zh-hans/support', description: 'AMD 显卡处理器官方驱动', descriptionEn: 'AMD official drivers', enabled: true },
      { id: 'intel', title: 'Intel 驱动', titleEn: 'Intel', href: 'https://www.intel.cn/content/www/cn/zh/download-center/home.html', description: '英特尔核显芯片组网卡官方驱动', descriptionEn: 'Intel official drivers', enabled: true },
      { id: 'realtek', title: 'Realtek 驱动', titleEn: 'Realtek', href: 'https://www.realtek.com/', description: '瑞昱声卡网卡官方驱动下载中心', descriptionEn: 'Realtek official drivers', enabled: true },
    ],
  },
  {
    id: 'peripheral-drivers',
    title: '键鼠外设驱动',
    titleEn: 'Peripheral Drivers',
    items: [
      { id: 'eweadn', title: '前行者驱动', titleEn: 'EWEADN', href: 'http://www.eweadn.cn/', description: '前行者键盘鼠标国内官方服务支持与驱动下载', descriptionEn: 'EWEADN official China drivers', enabled: true },
      { id: 'mchose', title: '迈从驱动', titleEn: 'MCHOSE', href: 'https://www.maicong.cn/support/hub/', description: '迈从 M HUB 官方下载中心与固件升级', descriptionEn: 'MCHOSE official China download center', enabled: true },
      { id: 'inphic', title: '英菲克驱动', titleEn: 'Inphic', href: 'https://www.inphic.cn/', description: '英菲克鼠标键盘国内官方驱动与软件中心', descriptionEn: 'Inphic official China drivers', enabled: true },
      { id: 'logitech', title: '罗技驱动', titleEn: 'Logitech', href: 'https://support.logi.com/hc/zh-cn', description: '罗技官方服务支持与 G HUB / Options+ 驱动下载', descriptionEn: 'Logitech official support and drivers', enabled: true },
      { id: 'razer', title: '雷蛇驱动', titleEn: 'Razer', href: 'https://www.razer.com/synapse', description: '雷蛇官方驱动（雷云 Synapse 与固件更新）', descriptionEn: 'Razer Synapse official drivers', enabled: true },
      { id: 'rapoo', title: '雷柏驱动', titleEn: 'Rapoo', href: 'https://www.rapoo.cn/', description: '雷柏键鼠中国官方驱动下载与服务中心', descriptionEn: 'Rapoo official drivers', enabled: true },
      { id: 'dareu', title: '达尔优驱动', titleEn: 'Dareu', href: 'https://dr.dareu.com/', description: '达尔优外设官方驱动与 All in One 网页驱动', descriptionEn: 'Dareu official China drivers', enabled: true },
      { id: 'a4tech', title: '双飞燕 / 血手幽灵', titleEn: 'A4Tech / Bloody', href: 'https://www.bloody.com/', description: '血手幽灵与双飞燕官方驱动下载中心', descriptionEn: 'A4Tech / Bloody official drivers', enabled: true },
    ],
  },
  {
    id: 'driver-tools',
    title: '驱动管理工具',
    titleEn: 'Driver Tools',
    items: [
      { id: 'drivergenius', title: '驱动精灵', titleEn: 'Driver Genius', href: 'http://www.drivergenius.com/', description: '自动检测并安装缺失驱动', descriptionEn: 'Auto detect and install drivers', enabled: true },
      { id: 'sysceo', title: '驱动总裁', titleEn: 'Sysceo', href: 'https://www.sysceo.com/', description: '离线驱动安装工具，装机常用', descriptionEn: 'Offline driver installer', enabled: true },
      { id: 'sdi', title: 'Snappy Driver Installer', titleEn: 'SDI', href: 'https://www.snappy-driver-installer.org/', description: '开源免费的驱动安装工具', descriptionEn: 'Open source driver installer', enabled: true },
    ],
  },
]

export interface CustomDriverItem extends NavigationSubItem {
  isCustom?: boolean
  categoryId?: string
}

export function DriversCenter() {
  const { locale, t } = useLanguage()
  const [customDrivers, setCustomDrivers] = useState<CustomDriverItem[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // 表单状态
  const [formUrl, setFormUrl] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCategory, setFormCategory] = useState('brand-drivers')
  const [isFetchingMeta, setIsFetchingMeta] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2500)
  }

  // 加载自定义驱动
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai-toolbox-custom-drivers')
      if (saved) {
        setCustomDrivers(JSON.parse(saved))
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
            showToast(t('✅ 已成功自动抓取厂商名称与简介！', 'Scraped title & description!'))
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
    setFormCategory(catId || 'brand-drivers')
    setShowAddModal(true)
  }

  const handleOpenEdit = (item: CustomDriverItem) => {
    setEditingId(item.id)
    setFormUrl(item.href)
    setFormTitle(item.title)
    setFormDesc(item.description || '')
    setFormCategory(item.categoryId || 'brand-drivers')
    setShowAddModal(true)
  }

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formUrl.trim() || !formTitle.trim()) {
      showToast(t('请填写驱动名称与官方网址', 'Please fill name and URL'))
      return
    }

    const fullUrl = formUrl.startsWith('http') ? formUrl.trim() : `https://${formUrl.trim()}`

    if (editingId) {
      const next = customDrivers.map((d) => {
        if (d.id === editingId) {
          return {
            ...d,
            title: formTitle.trim(),
            titleEn: formTitle.trim(),
            href: fullUrl,
            description: formDesc.trim(),
            descriptionEn: formDesc.trim(),
            categoryId: formCategory,
          }
        }
        return d
      })
      setCustomDrivers(next)
      try { localStorage.setItem('ai-toolbox-custom-drivers', JSON.stringify(next)) } catch {}
      showToast(t(`✅ 已更新驱动「${formTitle.trim()}」！`, `Updated driver "${formTitle.trim()}"!`))
    } else {
      const newDriver: CustomDriverItem = {
        id: `custom-driver-${Date.now()}`,
        title: formTitle.trim(),
        titleEn: formTitle.trim(),
        href: fullUrl,
        description: formDesc.trim(),
        descriptionEn: formDesc.trim(),
        categoryId: formCategory,
        isCustom: true,
        enabled: true
      }
      const next = [...customDrivers, newDriver]
      setCustomDrivers(next)
      try { localStorage.setItem('ai-toolbox-custom-drivers', JSON.stringify(next)) } catch {}
      showToast(t(`✅ 已成功添加驱动「${newDriver.title}」！`, `Added driver "${newDriver.title}"!`))
    }

    setShowAddModal(false)
    setEditingId(null)
  }

  const handleDeleteDriver = (id: string) => {
    const next = customDrivers.filter((d) => d.id !== id)
    setCustomDrivers(next)
    try { localStorage.setItem('ai-toolbox-custom-drivers', JSON.stringify(next)) } catch {}
    showToast(t('已删除自定义驱动', 'Custom driver deleted'))
  }

  const mergedCategories = useMemo(() => {
    return DRIVER_DATA.map((cat) => {
      const catCustom = customDrivers.filter((cd) => (cd.categoryId || 'brand-drivers') === cat.id)
      return {
        ...cat,
        items: [...cat.items, ...catCustom]
      }
    })
  }, [customDrivers])

  return (
    <div className="min-h-screen bg-background relative">
      {/* 全局反馈 Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[110] px-4 py-2 bg-foreground text-background text-xs font-semibold rounded-full shadow-lg border border-border/20 animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-none">
          {toastMessage}
        </div>
      )}

      {/* 新增/编辑驱动弹窗 */}
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
                  {editingId ? t('编辑自定义驱动', 'Edit Custom Driver') : t('添加自定义驱动', 'Add Custom Driver')}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDriver} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  {t('驱动下载链接 / 官网网址', 'Driver Portal URL')} *
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
                  {t('驱动/品牌名称', 'Driver / Brand Name')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('如：Keychron 键盘驱动', 'e.g. Keychron Driver')}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border/60 focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  {t('驱动简介 / 型号说明', 'Description')}
                </label>
                <input
                  type="text"
                  placeholder={t('如：Keychron 官方固件升级与按键映射工具', 'e.g. Keychron official firmware and keymap tool')}
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
                  {DRIVER_DATA.map((cat) => (
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
                  <span>{editingId ? t('保存修改', 'Save Changes') : t('立即添加', 'Add Driver')}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 顶部导航 */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="flex items-center gap-4 px-5 sm:px-10 sm:pl-24 h-14 max-w-6xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              {t('首页', 'Home')}
            </Button>
          </Link>
          <h1 className="text-lg font-bold tracking-tight">{t('驱动工具中心', 'Driver Center')}</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenAdd()}
              className="h-8 text-xs gap-1.5 border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-medium"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t('添加驱动', 'Add Driver')}</span>
            </Button>
            <div className="w-[1px] h-4 bg-border/60 mx-0.5" />
            <Link href="/tools" aria-label={t('网络工具箱', 'Network Tools')}>
              <Button variant="ghost" size="icon" className="hover:bg-accent/50 h-8 w-8">
                <Globe className="h-[17px] w-[17px]" />
              </Button>
            </Link>
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

      <div className="px-5 sm:px-10 sm:pl-24 pt-10 pb-8">
        <div className="max-w-5xl mx-auto">
          <section className="mb-12 sm:mb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-[2.5rem] font-bold leading-[1.15] tracking-tight">
                {t('驱动工具中心', 'Driver Center')}
              </h2>
              <p className="mt-2.5 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl">
                {t('官方驱动下载入口汇总，支持添加个人客制化与小众外设驱动。', 'Official driver download hubs with custom driver support.')}
              </p>
            </div>
            <Button
              onClick={() => handleOpenAdd()}
              className="gap-2 text-xs h-9 bg-primary text-primary-foreground font-semibold shadow-xs flex-shrink-0 self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>{t('➕ 添加自定义驱动', 'Add Custom Driver')}</span>
            </Button>
          </section>

          <div className="space-y-14 sm:space-y-20">
            {mergedCategories.map((category) => (
              <section key={category.id} id={category.id} className="scroll-m-20">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                      {locale === 'en' ? category.titleEn : category.title}
                    </h3>
                    <span className="text-xs text-muted-foreground tabular-nums font-medium">
                      {category.items.length}
                    </span>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.items.map((item) => (
                    <div key={item.id} className="relative group">
                      <NavigationCard item={item} />
                      {(item as CustomDriverItem).isCustom && (
                        <div className="absolute top-2 right-9 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 backdrop-blur-xs p-0.5 rounded-md border border-border/50 shadow-xs">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleOpenEdit(item as CustomDriverItem)
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
                              handleDeleteDriver(item.id)
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

