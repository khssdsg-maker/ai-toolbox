'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ExternalLink, Sparkles, FileUp, ShieldCheck } from 'lucide-react'
import { Button } from '@/registry/new-york/ui/button'
import Link from 'next/link'
import { SiteFavicon } from './site-favicon'

const CONVERTIO_URL = 'https://convertio.co/zh/'

// 桌面端（Electron）主进程已对 convertio.co 移除 X-Frame-Options，可 iframe 内嵌；
// 普通浏览器中 Convertio 禁止被内嵌，降级为跳转卡片
function isElectron(): boolean {
  return typeof window !== 'undefined' && /electron/i.test(navigator.userAgent)
}

export function ConvertCenter() {
  const [embedded, setEmbedded] = useState(false)

  useEffect(() => {
    setEmbedded(isElectron())
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 顶部 */}
      <header className="flex-none bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="flex items-center gap-4 px-5 sm:px-10 h-14 max-w-[1600px] w-full mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              首页
            </Button>
          </Link>
          <h1 className="text-lg font-bold tracking-tight">文件转换</h1>
          <div className="flex-1" />
          <a href={CONVERTIO_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="h-4 w-4" />
              新窗口打开
            </Button>
          </a>
        </div>
      </header>

      {embedded ? (
        <iframe
          src={CONVERTIO_URL}
          title="Convertio 文件转换"
          className="flex-1 w-full border-0 bg-background"
          allowFullScreen
        />
      ) : (
        <ConvertioCard />
      )}
    </div>
  )
}

// ============ 网页版降级：跳转卡片 ============
function ConvertioCard() {
  return (
    <div className="flex-1 flex items-center justify-center px-5 sm:px-10 py-16">
      <div className="max-w-xl w-full">
        <a
          href={CONVERTIO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-card border border-border/40 rounded-2xl p-8 sm:p-10 text-center transition-all duration-200 hover:border-border/80 hover:shadow-lg hover:-translate-y-0.5"
        >
          <div className="flex justify-center mb-5">
            <SiteFavicon title="Convertio" href={CONVERTIO_URL} className="w-16 h-16 rounded-2xl" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Convertio 文件转换</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            全球领先的在线文件转换平台，支持 300+ 种格式互转：PDF、Word、Excel、PPT、图片、音视频、电子书等，无需安装任何软件。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted/60 text-muted-foreground">
              <FileUp className="h-3.5 w-3.5" /> 300+ 文件格式
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted/60 text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> 拖拽即转
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted/60 text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> 文件加密保护
            </span>
          </div>
          <Button className="gap-2">
            <ExternalLink className="h-4 w-4" />
            打开 Convertio
          </Button>
        </a>
        <p className="text-xs text-muted-foreground text-center mt-4">
          由于 Convertio 官方限制网页内嵌，请在新标签页中打开使用
        </p>
      </div>
    </div>
  )
}
