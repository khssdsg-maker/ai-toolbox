'use client'

// 应用设置弹窗：设置链接的默认打开方式
import { useState, useEffect } from 'react'
import { X, Settings2 } from 'lucide-react'
import { Button } from '@/registry/new-york/ui/button'

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
  const [isDesktop, setIsDesktop] = useState(false)
  const [settings, setSettings] = useState<LinkSettings>({ mode: 'ask', browserPath: '' })
  const [browsers, setBrowsers] = useState<BrowserInfo[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!open) return
    const api = (window as unknown as {
      appAPI?: {
        getSettings?: () => Promise<{ settings: LinkSettings; browsers: BrowserInfo[] }>
        saveSettings?: (s: LinkSettings) => void
      }
    }).appAPI

    if (api && api.getSettings) {
      setIsDesktop(true)
      api.getSettings().then((data) => {
        setSettings(data.settings || { mode: 'ask', browserPath: '' })
        setBrowsers(data.browsers || [])
      }).catch(() => {})
    } else {
      setIsDesktop(false)
    }
  }, [open])

  if (!open) return null

  const handleSave = () => {
    const api = (window as unknown as { appAPI?: { saveSettings?: (s: LinkSettings) => void } }).appAPI
    if (api && api.saveSettings) {
      api.saveSettings(settings)
    }
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 800)
  }

  const options = [
    { value: 'ask', label: '每次询问我' },
    { value: 'internal', label: '应用内浏览器打开（带标签页）' },
    { value: 'external', label: '系统默认浏览器' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md mx-4 rounded-2xl bg-card border border-border/50 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">设置</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!isDesktop ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            设置功能仅在桌面应用中可用
          </p>
        ) : (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold mb-3">链接打开方式</h3>
              <div className="space-y-2">
                {options.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      settings.mode === opt.value && !(opt.value === 'external' && settings.browserPath)
                        ? 'border-primary bg-primary/5'
                        : 'border-border/50 hover:border-border'
                    }`}
                  >
                    <input
                      type="radio"
                      name="linkmode"
                      checked={settings.mode === opt.value && !(opt.value === 'external' && settings.browserPath)}
                      onChange={() => setSettings({ mode: opt.value, browserPath: '' })}
                      className="accent-[hsl(33_92%_55%)]"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}

                {/* 指定浏览器 */}
                {browsers.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs text-muted-foreground mb-2">或指定浏览器：</p>
                    <div className="grid grid-cols-2 gap-2">
                      {browsers.map((b) => (
                        <label
                          key={b.path}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors text-sm ${
                            settings.browserPath === b.path
                              ? 'border-primary bg-primary/5'
                              : 'border-border/50 hover:border-border'
                          }`}
                        >
                          <input
                            type="radio"
                            name="linkmode"
                            checked={settings.browserPath === b.path}
                            onChange={() => setSettings({ mode: 'external', browserPath: b.path })}
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

            <Button onClick={handleSave} className="w-full">
              {saved ? '已保存 ✓' : '保存设置'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
