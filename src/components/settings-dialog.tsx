'use client'

// 应用设置弹窗：链接打开方式 / 主题外观 / 界面语言 / 数据管理 / 关于与更新日志
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Settings2, Sun, Moon, Monitor, Github, ExternalLink, History, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/registry/new-york/ui/button'
import { useTheme } from 'next-themes'
import { useLanguage } from '@/lib/language-context'

interface BrowserInfo {
  name: string
  path: string
}

interface LinkSettings {
  mode: string
  browserPath: string
}

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

interface ReleaseNote {
  version: string
  date: string
  title: string
  titleEn: string
  changes: string[]
  changesEn: string[]
}

const RECENT_RELEASE_NOTES: ReleaseNote[] = [
  {
    version: 'v1.2.1',
    date: '2026-08-10',
    title: '海量 AI 工具更新与开发者链接集成',
    titleEn: 'Massive AI tools expansion & developer info',
    changes: [
      '新增 Recapo.ai 智能视频剪辑平台（响应 Issue #1）',
      '新增 22 个全网热门 AI 工具（即梦AI、Sora、Luma、秘塔搜索、智谱清言、腾讯元宝、NotebookLM、ChatPDF、Windsurf 等）',
      '设置弹窗中添加 GitHub 项目仓库与开发者个人主页跳转按钮',
      '设置弹窗集成最近四次更新日志查看面板'
    ],
    changesEn: [
      'Added Recapo.ai AI video editing platform (Resolves Issue #1)',
      'Added 22 trending AI tools (Jimeng, Sora, Luma, Metaso, Zhipu, Yuanbao, NotebookLM, ChatPDF, etc.)',
      'Added GitHub repo and author profile links in Settings',
      'Integrated recent 4 release notes viewer in Settings'
    ]
  },
  {
    version: 'v1.2.0',
    date: '2026-08-03',
    title: '新增驱动中心与网络工具箱',
    titleEn: 'Driver Center & Network Tools Added',
    changes: [
      '新增驱动工具中心：品牌电脑、硬件厂商、键鼠外设官方驱动入口汇总',
      '新增网络工具箱：IP查询、DNS解析、HTTP检测与端口分析工具',
      '新增硬件驱动分类一键查找导航'
    ],
    changesEn: [
      'Added Driver Center for brand PC, hardware & outer peripherals driver downloads',
      'Added Network Toolbox for IP, DNS, HTTP status, and Port inspection',
      'Added categorized navigation for official driver portals'
    ]
  },
  {
    version: 'v1.1.0',
    date: '2026-08-01',
    title: '文件格式转换中心与内置浏览器',
    titleEn: 'File Converter & In-App Browser',
    changes: [
      '新增纯本地文件格式转换中心（图片互转、PDF↔Word、Markdown/JSON/CSV/Base64）',
      '新增内置多标签页浏览器，点击工具支持在应用内直接全屏多标签浏览',
      '支持收藏链接到本地文件库，自动提取视频封面与标题'
    ],
    changesEn: [
      'Added local file format converter (Images, PDF↔Word, Markdown, JSON, CSV)',
      'Added built-in multi-tab browser for smooth in-app web navigation',
      'Supported local link favorites with auto video metadata fetching'
    ]
  },
  {
    version: 'v1.0.0',
    date: '2026-07-25',
    title: 'AI万能工具箱首发版本上线',
    titleEn: 'Initial Release of AI Toolbox',
    changes: [
      'AI万能工具箱首个版本正式发布，内置 37+ 核心全球 AI 工具分类导航',
      '支持暗黑/浅色/跟随系统主题切换与中英文一键切换',
      '适配 Windows 桌面客户端与网页端响应式访问'
    ],
    changesEn: [
      'First official release with 37+ curated AI tool navigation',
      'Supported light/dark/system themes and bilingual language toggling',
      'Optimized responsive layouts for both desktop app and web'
    ]
  }
]

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const { locale, setLocale, t } = useLanguage()
  const [isDesktop, setIsDesktop] = useState(false)
  const [linkSettings, setLinkSettings] = useState<LinkSettings>({ mode: 'ask', browserPath: '' })
  const [browsers, setBrowsers] = useState<BrowserInfo[]>([])
  const [savedTip, setSavedTip] = useState(false)
  const [clearTip, setClearTip] = useState('')

  const [appVersion, setAppVersion] = useState('1.2.1')
  const [showChangelog, setShowChangelog] = useState(false)

  useEffect(() => {
    if (!open) return
    const api = (window as unknown as {
      appAPI?: {
        getSettings?: () => Promise<{ settings: LinkSettings; browsers: BrowserInfo[] }>
        getVersion?: () => Promise<string>
      }
    }).appAPI

    if (api) {
      if (api.getVersion) {
        api.getVersion().then((v) => { if (v) setAppVersion(v) }).catch(() => {})
      }
      if (api.getSettings) {
        setIsDesktop(true)
        api.getSettings().then((data) => {
          setLinkSettings(data.settings || { mode: 'ask', browserPath: '' })
          setBrowsers(data.browsers || [])
        }).catch(() => {})
      }
    } else {
      setIsDesktop(false)
    }
  }, [open])

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!open || !mounted) return null

  // 保存链接打开方式（桌面应用）
  const saveLinkSettings = (s: LinkSettings) => {
    setLinkSettings(s)
    const api = (window as unknown as { appAPI?: { saveSettings?: (x: LinkSettings) => void } }).appAPI
    if (api && api.saveSettings) {
      api.saveSettings(s)
      setSavedTip(true)
      setTimeout(() => setSavedTip(false), 1500)
    }
  }

  // 清空收藏
  const handleClearFavorites = async () => {
    if (!confirm(t('确定要清空所有收藏吗？此操作无法撤销。', 'Clear all favorites? This cannot be undone.'))) return
    // 清空本地收藏
    localStorage.removeItem('ai-toolbox-favorites')
    // 清空桌面应用收藏文件
    const api = (window as unknown as { appAPI?: { clearFavorites?: () => void } }).appAPI
    if (api && api.clearFavorites) {
      api.clearFavorites()
    }
    setClearTip(t('收藏已清空', 'Favorites cleared'))
    setTimeout(() => setClearTip(''), 2000)
  }

  const linkOptions = [
    { value: 'ask', label: t('每次询问我', 'Ask every time') },
    { value: 'internal', label: t('应用内浏览器打开（带标签页）', 'In-app browser (with tabs)') },
    { value: 'external', label: t('系统默认浏览器', 'System default browser') },
  ]

  const themeOptions = [
    { value: 'light', label: t('浅色', 'Light'), icon: Sun },
    { value: 'dark', label: t('深色', 'Dark'), icon: Moon },
    { value: 'system', label: t('跟随系统', 'System'), icon: Monitor },
  ]

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto rounded-2xl bg-card border border-border/50 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">{t('设置', 'Settings')}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* 主题外观 */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t('主题外观', 'Theme')}</h3>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((opt) => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors ${
                      theme === opt.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border/50 hover:border-border text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 界面语言 */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t('界面语言', 'Language')}</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLocale('zh')}
                className={`p-2.5 rounded-xl border text-sm transition-colors ${
                  locale === 'zh' ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border/50 hover:border-border text-muted-foreground'
                }`}
              >
                简体中文
              </button>
              <button
                onClick={() => setLocale('en')}
                className={`p-2.5 rounded-xl border text-sm transition-colors ${
                  locale === 'en' ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border/50 hover:border-border text-muted-foreground'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* 链接打开方式（仅桌面应用） */}
          {isDesktop && (
            <div>
              <h3 className="text-sm font-semibold mb-3">
                {t('链接打开方式', 'Link opening')}
                {savedTip && <span className="ml-2 text-xs text-green-600">{t('已保存 ✓', 'Saved ✓')}</span>}
              </h3>
              <div className="space-y-2">
                {linkOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      linkSettings.mode === opt.value && !(opt.value === 'external' && linkSettings.browserPath)
                        ? 'border-primary bg-primary/5'
                        : 'border-border/50 hover:border-border'
                    }`}
                  >
                    <input
                      type="radio"
                      name="linkmode"
                      checked={linkSettings.mode === opt.value && !(opt.value === 'external' && linkSettings.browserPath)}
                      onChange={() => saveLinkSettings({ mode: opt.value, browserPath: '' })}
                      className="accent-[hsl(33_92%_55%)]"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
                {browsers.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs text-muted-foreground mb-2">{t('或指定浏览器：', 'Or pick a browser:')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {browsers.map((b) => (
                        <label
                          key={b.path}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors text-sm ${
                            linkSettings.browserPath === b.path
                              ? 'border-primary bg-primary/5'
                              : 'border-border/50 hover:border-border'
                          }`}
                        >
                          <input
                            type="radio"
                            name="linkmode"
                            checked={linkSettings.browserPath === b.path}
                            onChange={() => saveLinkSettings({ mode: 'external', browserPath: b.path })}
                            className="accent-[hsl(33_92%_55%)]"
                          />
                          {b.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 数据管理 */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t('数据管理', 'Data')}</h3>
            <Button variant="outline" size="sm" onClick={handleClearFavorites} className="text-red-500 border-red-500/30 hover:bg-red-500/10 hover:text-red-600">
              {clearTip || t('清空所有收藏', 'Clear all favorites')}
            </Button>
          </div>

          {/* 最近更新日志面板 */}
          <div className="pt-2 border-t border-border/40 space-y-3">
            <button
              onClick={() => setShowChangelog(!showChangelog)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-primary font-medium text-sm"
            >
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <span>{t('最近 4 次更新日志', 'Recent 4 Release Notes')}</span>
              </div>
              {showChangelog ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showChangelog && (
              <div className="space-y-4 p-3 rounded-xl bg-muted/40 border border-border/50 text-xs animate-in fade-in duration-200">
                {RECENT_RELEASE_NOTES.map((note) => (
                  <div key={note.version} className="space-y-1.5 pb-3 border-b border-border/30 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between font-semibold text-foreground">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        {note.version} — {locale === 'zh' ? note.title : note.titleEn}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70 font-mono">{note.date}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                      {(locale === 'zh' ? note.changes : note.changesEn).map((change, idx) => (
                        <li key={idx} className="leading-relaxed">{change}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* 关于与开发者 */}
            <div className="pt-2 flex flex-col items-center gap-2 text-xs">
              <p className="text-muted-foreground">
                {t('AI万能工具箱', 'AI Toolbox')} v{appVersion} · {t('AI 时代的超级工具箱', 'The super toolbox for the AI era')}
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/khssdsg-maker/ai-toolbox"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Github className="h-3.5 w-3.5" />
                  <span>{t('GitHub 仓库', 'GitHub Repo')}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
                <span className="text-border">|</span>
                <a
                  href="https://github.com/khssdsg-maker"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <span>{t('开发者: khssdsg-maker', 'Author: khssdsg-maker')}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
