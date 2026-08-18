'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRightLeft,
  Columns2,
  Maximize2,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Copy,
  Check,
  Plus,
  Trash2,
  Send,
  HelpCircle,
  Laptop,
  Globe,
  SlidersHorizontal,
  ChevronDown,
  X
} from 'lucide-react'
import { PRESET_MODELS, getCustomModels, saveCustomModel, removeCustomModel, type ArenaModel } from '@/data/arena-models'
import { PROMPTS_DATA, type PromptItem } from '@/data/prompts-data'
import { SiteFavicon } from '@/components/site-favicon'
import { WindowControls } from '@/components/window-controls'
import { Button } from '@/registry/new-york/ui/button'
import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'

const DESKTOP_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

function isElectron(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!(window as unknown as { appAPI?: unknown }).appAPI
  )
}

export function ArenaContent() {
  const { locale, t } = useLanguage()
  const searchParams = useSearchParams()

  const [customModels, setCustomModels] = useState<ArenaModel[]>([])
  const [leftModelId, setLeftModelId] = useState<string>('deepseek')
  const [rightModelId, setRightModelId] = useState<string>('chatgpt')
  const [layoutMode, setLayoutMode] = useState<'split' | 'left' | 'right'>('split')

  // 刷新 key 控制 iframe 重新加载
  const [leftRefreshKey, setLeftRefreshKey] = useState(0)
  const [rightRefreshKey, setRightRefreshKey] = useState(0)

  // 底部统一提问输入框
  const [promptInput, setPromptInput] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  // 自定义模型弹窗状态
  const [showAddModal, setShowAddModal] = useState(false)
  const [newModelName, setNewModelName] = useState('')
  const [newModelUrl, setNewModelUrl] = useState('')
  const [newModelTag, setNewModelTag] = useState('')

  // 模板选择器抽屉状态
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)

  const [embedded, setEmbedded] = useState(false)

  useEffect(() => {
    setEmbedded(isElectron())
    setCustomModels(getCustomModels())

    // 支持从提示词宝典通过 URL query 带入 Prompt
    const initialPrompt = searchParams?.get('prompt')
    if (initialPrompt) {
      setPromptInput(decodeURIComponent(initialPrompt))
    }
  }, [searchParams])

  // 所有可用模型（预置 + 自定义）
  const allModels = useMemo(() => {
    return [...customModels, ...PRESET_MODELS]
  }, [customModels])

  const leftModel = useMemo(() => {
    return allModels.find((m) => m.id === leftModelId) || PRESET_MODELS[0]
  }, [allModels, leftModelId])

  const rightModel = useMemo(() => {
    return allModels.find((m) => m.id === rightModelId) || PRESET_MODELS[6]
  }, [allModels, rightModelId])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  // 交换左右模型
  const handleSwap = () => {
    const temp = leftModelId
    setLeftModelId(rightModelId)
    setRightModelId(temp)
    showToast(t('已交换左右分屏模型 ⇄', 'Swapped left and right models ⇄'))
  }

  // 复制提示词并提示
  const handleSendPrompt = () => {
    if (!promptInput.trim()) {
      showToast(t('请先输入问题或提示词内容', 'Please enter a prompt first'))
      return
    }
    navigator.clipboard.writeText(promptInput.trim())
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    showToast(t('✅ 问题已复制到剪贴板！切到左/右窗口按 Ctrl+V 即可发送', 'Prompt copied! Press Ctrl+V in either window to send'))
  }

  // 保存新增自定义模型
  const handleSaveCustomModel = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newModelName.trim() || !newModelUrl.trim()) {
      showToast(t('请填写模型名称和网址', 'Please enter model name and URL'))
      return
    }

    let url = newModelUrl.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    const created = saveCustomModel({
      name: newModelName.trim(),
      nameEn: newModelName.trim(),
      url,
      tag: newModelTag.trim() || t('用户自定义', 'Custom')
    })

    setCustomModels(getCustomModels())
    setLeftModelId(created.id)
    setShowAddModal(false)
    setNewModelName('')
    setNewModelUrl('')
    setNewModelTag('')
    showToast(t(`成功添加自定义模型：${created.name}`, `Added custom model: ${created.name}`))
  }

  // 删除自定义模型
  const handleDeleteCustomModel = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeCustomModel(id)
    setCustomModels(getCustomModels())
    if (leftModelId === id) setLeftModelId('deepseek')
    if (rightModelId === id) setRightModelId('chatgpt')
    showToast(t(`已移除模型：${name}`, `Removed model: ${name}`))
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Toast 提醒 */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMsg}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 顶部控制栏 */}
      {/* ========================================================================= */}
      <header className="flex-none bg-background/90 backdrop-blur-lg border-b border-border/40 h-14 px-4 sm:px-6 sm:pl-24 flex items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t('首页', 'Home')}</span>
            </Button>
          </Link>

          <div className="h-4 w-[1px] bg-border/60" />

          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-primary/10 text-primary">
              <Columns2 className="w-4 h-4" />
            </span>
            <h1 className="font-bold text-sm sm:text-base tracking-tight hidden md:inline">
              {t('AI 大模型分屏对比台', 'AI Model Arena')}
            </h1>
          </div>
        </div>

        {/* 模型选择与控制中枢 */}
        <div className="flex items-center gap-2 max-w-full">
          {/* 左屏模型选择器 */}
          <div className="relative">
            <select
              value={leftModelId}
              onChange={(e) => {
                if (e.target.value === '__add_new__') {
                  setShowAddModal(true)
                } else {
                  setLeftModelId(e.target.value)
                }
              }}
              className="h-8 pl-2.5 pr-7 rounded-lg bg-card border border-border/80 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer hover:border-primary/60 transition-colors max-w-[130px] sm:max-w-[160px] truncate"
            >
              <optgroup label={t('🇨🇳 国内直连大模型', 'Domestic Direct Models')}>
                {PRESET_MODELS.slice(0, 6).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t('🌐 国际顶流大模型', 'Global Top Models')}>
                {PRESET_MODELS.slice(6).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
              {customModels.length > 0 && (
                <optgroup label={t('⭐ 我的自定义模型', 'Custom Models')}>
                  {customModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      ★ {m.name}
                    </option>
                  ))}
                </optgroup>
              )}
              <option value="__add_new__">+ {t('添加自定义模型...', 'Add Custom Model...')}</option>
            </select>
            <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 交换按钮 */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwap}
            title={t('交换左右模型 (⇄)', 'Swap Left & Right')}
            className="h-8 w-8 rounded-lg flex-shrink-0"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </Button>

          {/* 右屏模型选择器 */}
          <div className="relative">
            <select
              value={rightModelId}
              onChange={(e) => {
                if (e.target.value === '__add_new__') {
                  setShowAddModal(true)
                } else {
                  setRightModelId(e.target.value)
                }
              }}
              className="h-8 pl-2.5 pr-7 rounded-lg bg-card border border-border/80 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer hover:border-primary/60 transition-colors max-w-[130px] sm:max-w-[160px] truncate"
            >
              <optgroup label={t('🌐 国际顶流大模型', 'Global Top Models')}>
                {PRESET_MODELS.slice(6).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t('🇨🇳 国内直连大模型', 'Domestic Direct Models')}>
                {PRESET_MODELS.slice(0, 6).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
              {customModels.length > 0 && (
                <optgroup label={t('⭐ 我的自定义模型', 'Custom Models')}>
                  {customModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      ★ {m.name}
                    </option>
                  ))}
                </optgroup>
              )}
              <option value="__add_new__">+ {t('添加自定义模型...', 'Add Custom Model...')}</option>
            </select>
            <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 分屏模式切换 */}
          <div className="hidden lg:flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60 text-xs">
            <button
              onClick={() => setLayoutMode('split')}
              title={t('1:1 双栏分屏', '1:1 Split')}
              className={cn(
                'px-2 py-1 rounded-md font-medium transition-all',
                layoutMode === 'split' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('双栏分屏', 'Split')}
            </button>
            <button
              onClick={() => setLayoutMode('left')}
              title={t('仅看左屏', 'Left Only')}
              className={cn(
                'px-2 py-1 rounded-md font-medium transition-all',
                layoutMode === 'left' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('左单屏', 'Left')}
            </button>
            <button
              onClick={() => setLayoutMode('right')}
              title={t('仅看右屏', 'Right Only')}
              className={cn(
                'px-2 py-1 rounded-md font-medium transition-all',
                layoutMode === 'right' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('右单屏', 'Right')}
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="h-8 gap-1 text-xs hidden sm:flex"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('自定义', 'Custom')}</span>
          </Button>

          <WindowControls />
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 分屏主体渲染区域 */}
      {/* ========================================================================= */}
      <div className="flex-1 flex min-h-0 relative sm:pl-20">
        {/* 左屏容器 */}
        {(layoutMode === 'split' || layoutMode === 'left') && (
          <div className={cn('flex flex-col border-r border-border/40 bg-background', layoutMode === 'split' ? 'w-1/2' : 'w-full')}>
            {/* 左屏顶部工具条 */}
            <div className="h-8 px-3 bg-muted/40 border-b border-border/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <SiteFavicon title={leftModel.name} href={leftModel.url} className="w-4 h-4 rounded-sm flex-shrink-0" />
                <span className="font-bold truncate text-foreground">{leftModel.name}</span>
                <span className="text-[10px] text-muted-foreground bg-primary/10 text-primary px-1.5 py-0.2 rounded border border-primary/20 hidden md:inline">
                  {leftModel.tag}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setLeftRefreshKey((k) => k + 1)}
                  title={t('刷新左侧页面', 'Reload')}
                  className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <a
                  href={leftModel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t('在新窗口中打开', 'Open in new tab')}
                  className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* 左屏 webview 内容 */}
            <div className="flex-1 relative bg-background">
              {embedded ? (
                <webview
                  key={`left-${leftModel.id}-${leftRefreshKey}`}
                  src={leftModel.url}
                  partition="persist:ai_arena"
                  allowpopups={true}
                  className="w-full h-full border-0"
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <WebFallbackView model={leftModel} />
              )}
            </div>
          </div>
        )}

        {/* 右屏容器 */}
        {(layoutMode === 'split' || layoutMode === 'right') && (
          <div className={cn('flex flex-col bg-background', layoutMode === 'split' ? 'w-1/2' : 'w-full')}>
            {/* 右屏顶部工具条 */}
            <div className="h-8 px-3 bg-muted/40 border-b border-border/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <SiteFavicon title={rightModel.name} href={rightModel.url} className="w-4 h-4 rounded-sm flex-shrink-0" />
                <span className="font-bold truncate text-foreground">{rightModel.name}</span>
                <span className="text-[10px] text-muted-foreground bg-blue-500/10 text-blue-500 px-1.5 py-0.2 rounded border border-blue-500/20 hidden md:inline">
                  {rightModel.tag}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setRightRefreshKey((k) => k + 1)}
                  title={t('刷新右侧页面', 'Reload')}
                  className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <a
                  href={rightModel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t('在新窗口中打开', 'Open in new tab')}
                  className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* 右屏 webview 内容 */}
            <div className="flex-1 relative bg-background">
              {embedded ? (
                <webview
                  key={`right-${rightModel.id}-${rightRefreshKey}`}
                  src={rightModel.url}
                  partition="persist:ai_arena"
                  allowpopups={true}
                  className="w-full h-full border-0"
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <WebFallbackView model={rightModel} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 底部统一提问发射台 (Unified Prompt Action Bar) */}
      {/* ========================================================================= */}
      <footer className="flex-none bg-card border-t border-border/60 p-3 sm:px-6 sm:pl-24 shadow-lg z-30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <textarea
              rows={1}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  handleSendPrompt()
                }
              }}
              placeholder={t(
                '💡 输入问题或提示词... 按 Ctrl+Enter 复制并准备同步发送至左右大模型',
                'Enter prompt... Press Ctrl+Enter to copy and ready for dual models'
              )}
              className="w-full pl-3 pr-20 py-2 rounded-xl bg-background border border-border/80 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-all placeholder:text-muted-foreground/60 leading-normal"
            />
            {promptInput && (
              <button
                onClick={() => setPromptInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-1 rounded bg-muted/60"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplatePicker(true)}
              className="h-9 gap-1.5 text-xs whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('载入提示词模板', 'Load Template')}</span>
            </Button>

            <Button
              size="sm"
              onClick={handleSendPrompt}
              className={cn(
                'h-9 gap-1.5 text-xs font-semibold px-4 transition-all shadow-sm whitespace-nowrap',
                isCopied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('已复制 ✓', 'Copied ✓')}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('🚀 复制并准备发送', 'Copy & Ready')}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 弹窗：添加自定义大模型 */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCustomModel}
            className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                <span>{t('添加自定义 AI 大模型网址', 'Add Custom AI Model')}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">{t('模型名称 *', 'Model Name *')}</label>
                <input
                  type="text"
                  required
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="如：我的本地Ollama / 公司知识库 / Grok"
                  className="w-full p-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">{t('网页 URL 网址 *', 'Website URL *')}</label>
                <input
                  type="text"
                  required
                  value={newModelUrl}
                  onChange={(e) => setNewModelUrl(e.target.value)}
                  placeholder="如：http://localhost:3000 或 https://grok.com/"
                  className="w-full p-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">{t('标签/备注（可选）', 'Tag / Remark')}</label>
                <input
                  type="text"
                  value={newModelTag}
                  onChange={(e) => setNewModelTag(e.target.value)}
                  placeholder="如：本地私有部署 / 团队专用"
                  className="w-full p-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* 已有自定义列表 */}
            {customModels.length > 0 && (
              <div className="pt-2 border-t border-border/40 space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground">{t('已有自定义模型：', 'Existing Custom Models:')}</span>
                <div className="max-h-24 overflow-y-auto space-y-1 scrollbar-thin">
                  {customModels.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-1.5 rounded-md bg-muted/40 text-xs">
                      <span className="font-medium truncate">{m.name}</span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCustomModel(m.id, m.name, e)}
                        className="text-red-500 hover:text-red-600 p-1"
                        title={t('删除此模型', 'Delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                {t('取消', 'Cancel')}
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                {t('保存并使用', 'Save & Use')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 弹窗：从提示词宝典快速选择模板 */}
      {/* ========================================================================= */}
      {showTemplatePicker && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{t('从【AI 提示词灵感宝典】快速载入实战模板', 'Load Template from Prompts Hub')}</span>
              </h2>
              <button
                onClick={() => setShowTemplatePicker(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin pr-1">
              {PROMPTS_DATA.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setPromptInput(item.prompt)
                    setShowTemplatePicker(false)
                    showToast(t(`已载入模板：${item.title}`, `Loaded: ${item.title}`))
                  }}
                  className="p-3.5 rounded-xl bg-background border border-border/60 hover:border-primary/60 hover:shadow-md cursor-pointer transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm group-hover:text-primary transition-colors">
                      {locale === 'en' ? item.titleEn : item.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {item.tags[0]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between">
              <Link href="/prompts" className="text-xs text-primary hover:underline flex items-center gap-1">
                <span>{t('前往完整提示词宝典进行参数填空 →', 'Go to Prompts Hub for full variables →')}</span>
              </Link>
              <Button size="sm" variant="outline" onClick={() => setShowTemplatePicker(false)}>
                {t('关闭', 'Close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 网页版降级卡片视图
function WebFallbackView({ model }: { model: ArenaModel }) {
  const { t } = useLanguage()
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-muted/20">
      <div className="max-w-sm space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-card border border-border/60 p-2 mx-auto flex items-center justify-center shadow-sm">
          <SiteFavicon title={model.name} href={model.url} className="w-8 h-8 rounded-lg" />
        </div>
        <h3 className="font-bold text-base">{model.name}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {model.tag} · {t('在桌面客户端中直接内嵌分屏。网页版支持新标签秒开。', 'Directly embedded in Desktop App. Open in new tab in Web.')}
        </p>
        <a
          href={model.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{t('在新窗口中打开体验', 'Open Website')}</span>
        </a>
      </div>
    </div>
  )
}
