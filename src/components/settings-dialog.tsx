'use client'

// 应用设置弹窗：链接打开方式 / 主题外观 / 界面语言 / 数据管理 / 关于
import { useState, useEffect } from 'react'
import { X, Settings2, Sun, Moon, Monitor } from 'lucide-react'
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

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const { locale, setLocale, t } = useLanguage()
  const [isDesktop, setIsDesktop] = useState(false)
  const [linkSettings, setLinkSettings] = useState<LinkSettings>({ mode: 'ask', browserPath: '' })
  const [browsers, setBrowsers] = useState<BrowserInfo[]>([])
  const [savedTip, setSavedTip] = useState(false)
  const [clearTip, setClearTip] = useState('')

  useEffect(() => {
    if (!open) return
    const api = (window as unknown as {
      appAPI?: {
        getSettings?: () => Promise<{ settings: LinkSettings; browsers: BrowserInfo[] }>
      }
    }).appAPI

    if (api && api.getSettings) {
      setIsDesktop(true)
      api.getSettings().then((data) => {
        setLinkSettings(data.settings || { mode: 'ask', browserPath: '' })
        setBrowsers(data.browsers || [])
      }).catch(() => {})
    } else {
      setIsDesktop(false)
    }
  }, [open])

  if (!open) return null

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
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

          {/* 关于 */}
          <div className="pt-4 border-t border-border/40">
            <p className="text-xs text-muted-foreground text-center">
              {t('AI万能工具箱', 'AI Toolbox')} v1.0.0
            </p>
            <p className="text-xs text-muted-foreground/70 text-center mt-1">
              {t('AI 时代的超级工具箱', 'The super toolbox for the AI era')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
