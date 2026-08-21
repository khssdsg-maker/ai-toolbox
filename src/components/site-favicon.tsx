'use client'

import { useState, useEffect, useCallback } from 'react'
import { LetterAvatar } from './letter-avatar'

interface SiteFaviconProps {
  title: string
  href?: string
  icon?: string
  useDefaultIcon?: boolean
  className?: string
}

// 知名硬件、驱动与 AI 品牌高保真抗反爬官方图标库（100% 免疫网站反爬虫与 404）
const BRAND_ICON_MAP: Record<string, string> = {
  'nvidia': 'https://api.iowen.cn/favicon/nvidia.cn.png',
  'amd': 'https://api.iowen.cn/favicon/amd.com.png',
  'intel': 'https://api.iowen.cn/favicon/intel.cn.png',
  'lenovo': 'https://api.iowen.cn/favicon/lenovo.com.cn.png',
  'dell': 'https://api.iowen.cn/favicon/dell.com.png',
  'hp': 'https://api.iowen.cn/favicon/hp.com.png',
  'huawei': 'https://api.iowen.cn/favicon/huawei.com.png',
  'asus': 'https://api.iowen.cn/favicon/asus.com.cn.png',
  'acer': 'https://api.iowen.cn/favicon/acer.com.cn.png',
  'msi': 'https://api.iowen.cn/favicon/msi.com.png',
  'realtek': 'https://api.iowen.cn/favicon/realtek.com.png',
  'logitech': 'https://api.iowen.cn/favicon/logitech.com.png',
  'logi': 'https://api.iowen.cn/favicon/logitech.com.png',
  'razer': 'https://api.iowen.cn/favicon/razer.com.png',
  'rapoo': 'https://api.iowen.cn/favicon/rapoo.cn.png',
  'dareu': 'https://api.iowen.cn/favicon/dareu.com.png',
  'a4tech': 'https://api.iowen.cn/favicon/bloody.com.png',
  'bloody': 'https://api.iowen.cn/favicon/bloody.com.png',
  'eweadn': 'https://api.iowen.cn/favicon/eweadn.cn.png',
  'mchose': 'https://api.iowen.cn/favicon/maicong.cn.png',
  'maicong': 'https://api.iowen.cn/favicon/maicong.cn.png',
  'inphic': 'https://api.iowen.cn/favicon/inphic.cn.png',
  'drivergenius': 'https://api.iowen.cn/favicon/drivergenius.com.png',
  'sysceo': 'https://api.iowen.cn/favicon/sysceo.com.png',
  'snappy': 'https://api.iowen.cn/favicon/snappy-driver-installer.org.png',
  'deepseek': 'https://api.iowen.cn/favicon/deepseek.com.png',
  'qwen': 'https://api.iowen.cn/favicon/tongyi.aliyun.com.png',
  'kimi': 'https://api.iowen.cn/favicon/moonshot.cn.png',
  'doubao': 'https://api.iowen.cn/favicon/doubao.com.png',
  'chatgpt': 'https://api.iowen.cn/favicon/openai.com.png',
  'claude': 'https://api.iowen.cn/favicon/anthropic.com.png',
  'cursor': 'https://api.iowen.cn/favicon/cursor.com.png',
  'v0': 'https://api.iowen.cn/favicon/v0.dev.png',
  'convertio': 'https://api.iowen.cn/favicon/convertio.co.png',
  'cloudconvert': 'https://api.iowen.cn/favicon/cloudconvert.com.png',
  'ilovepdf': 'https://api.iowen.cn/favicon/ilovepdf.com.png',
  'iloveimg': 'https://api.iowen.cn/favicon/iloveimg.com.png',
  'pdf24': 'https://api.iowen.cn/favicon/pdf24.org.png',
  'squoosh': 'https://api.iowen.cn/favicon/squoosh.app.png',
  'ezgif': 'https://api.iowen.cn/favicon/ezgif.com.png',
  'tinywow': 'https://api.iowen.cn/favicon/tinywow.com.png',
  'freeconvert': 'https://api.iowen.cn/favicon/freeconvert.com.png',
  'vectorizer': 'https://api.iowen.cn/favicon/vectorizer.ai.png',
  'smallpdf': 'https://api.iowen.cn/favicon/smallpdf.com.png',
  'yizhuanhuan': 'https://api.iowen.cn/favicon/yizhuanhuan.com.png',
  'aconvert': 'https://api.iowen.cn/favicon/aconvert.com.png',
}

// 提取完整主机名
function getHostname(url?: string): string {
  if (!url) return ''
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    return parsed.hostname.toLowerCase()
  } catch {
    return ''
  }
}

// 智能根域名归一化（如 newsupport.lenovo.com.cn ➔ lenovo.com.cn, support.hp.com ➔ hp.com）
function extractRootDomain(hostname: string): string {
  if (!hostname) return ''
  const cleanHost = hostname.replace(/^www\./, '')
  const parts = cleanHost.split('.')
  if (parts.length <= 2) return cleanHost
  // 处理 .com.cn, .net.cn, .org.cn, .edu.cn 等双后缀
  if (parts.length >= 3 && (parts[parts.length - 2] === 'com' || parts[parts.length - 2] === 'net' || parts[parts.length - 2] === 'org' || parts[parts.length - 2] === 'gov')) {
    return parts.slice(-3).join('.')
  }
  return parts.slice(-2).join('.')
}

const CACHE_PREFIX = 'ai_fav_cache_v4_'
const faviconCache = new Map<string, { src: string; fallbackIndex: number }>()

// 获取多通道防反爬候选源矩阵
function getCandidateSources(rawUrl?: string, explicitIcon?: string, useDefault?: boolean): string[] {
  const sources: string[] = []
  if (explicitIcon && explicitIcon.trim() !== '' && !useDefault) {
    sources.push(explicitIcon.trim())
  }

  const hostname = getHostname(rawUrl)
  if (hostname) {
    const rootDomain = extractRootDomain(hostname)
    const brandKey = rootDomain.split('.')[0]

    // 0. 如果命中内置知名硬件/大厂字典，优先采用权威直链
    if (brandKey && BRAND_ICON_MAP[brandKey]) {
      sources.push(BRAND_ICON_MAP[brandKey])
    }

    // 1. 国内高速源 (根域名)
    if (rootDomain) sources.push(`https://api.iowen.cn/favicon/${rootDomain}.png`)
    // 2. 国际免墙源 (根域名)
    if (rootDomain) sources.push(`https://favicon.im/${rootDomain}`)
    // 3. 国内高速源 (完整子域名)
    if (hostname !== rootDomain) sources.push(`https://api.iowen.cn/favicon/${hostname}.png`)
    // 4. 国际免墙源 (完整子域名)
    if (hostname !== rootDomain) sources.push(`https://favicon.im/${hostname}`)
    // 5. DuckDuckGo 图标源
    if (rootDomain) sources.push(`https://icons.duckduckgo.com/ip3/${rootDomain}.ico`)
    // 6. 原生根目录 .ico
    if (rootDomain) sources.push(`https://${rootDomain}/favicon.ico`)
    if (hostname !== rootDomain) sources.push(`https://${hostname}/favicon.ico`)
  }

  return Array.from(new Set(sources.filter(Boolean)))
}

export function SiteFavicon({ title, href, icon, useDefaultIcon, className }: SiteFaviconProps) {
  const hostname = getHostname(href)
  const rootDomain = extractRootDomain(hostname)
  const cacheKey = rootDomain || hostname || (icon && icon.trim() !== '' ? `icon:${icon}` : title)
  const candidates = getCandidateSources(href, icon, useDefaultIcon)

  const [state, setState] = useState<{ src: string; fallbackIndex: number }>(() => {
    if (cacheKey && faviconCache.has(cacheKey)) {
      return faviconCache.get(cacheKey)!
    }
    if (typeof window !== 'undefined' && cacheKey) {
      try {
        const stored = localStorage.getItem(CACHE_PREFIX + cacheKey)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed && typeof parsed.src === 'string' && parsed.src) {
            faviconCache.set(cacheKey, parsed)
            return parsed
          }
        }
      } catch {}
    }
    return { src: candidates[0] || '', fallbackIndex: 0 }
  })

  // 1. 单卡片精准定向刷新（由卡片上的 [🔄 重新拉取此图标] 触发）
  const refreshThisCard = useCallback(() => {
    try {
      if (cacheKey) {
        faviconCache.delete(cacheKey)
        localStorage.removeItem(CACHE_PREFIX + cacheKey)
      }
    } catch {}
    const freshSrc = candidates[0] ? `${candidates[0]}${candidates[0].includes('?') ? '&' : '?'}t=${Date.now()}` : ''
    setState({ src: freshSrc, fallbackIndex: 0 })
  }, [cacheKey, candidates])

  useEffect(() => {
    // 监听定向单卡片刷新指令
    const handleCardRefresh = (e: Event) => {
      const customEvent = e as CustomEvent<{ targetKey?: string }>
      if (customEvent.detail && (customEvent.detail.targetKey === cacheKey || customEvent.detail.targetKey === hostname || customEvent.detail.targetKey === rootDomain)) {
        refreshThisCard()
      }
    }

    // 监听状态栏【智能无损修复】指令：仅针对当前【空白/字母占位】的卡片重试，已正常显示的绝不触碰！
    const handleSafeRepair = () => {
      if (state.fallbackIndex >= candidates.length || !state.src) {
        refreshThisCard()
      }
    }

    window.addEventListener('ai-toolbox-refresh-single-card', handleCardRefresh)
    window.addEventListener('ai-toolbox-repair-broken-favicons', handleSafeRepair)
    return () => {
      window.removeEventListener('ai-toolbox-refresh-single-card', handleCardRefresh)
      window.removeEventListener('ai-toolbox-repair-broken-favicons', handleSafeRepair)
    }
  }, [cacheKey, hostname, rootDomain, state.fallbackIndex, state.src, candidates.length, refreshThisCard])

  const handleLoad = () => {
    if (!cacheKey || !state.src) return
    const current = { src: state.src, fallbackIndex: state.fallbackIndex }
    faviconCache.set(cacheKey, current)
    try { localStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify(current)) } catch {}
  }

  const handleError = () => {
    const nextIndex = state.fallbackIndex + 1
    if (nextIndex < candidates.length) {
      const nextSrc = candidates[nextIndex]
      const newState = { src: nextSrc, fallbackIndex: nextIndex }
      if (cacheKey) faviconCache.set(cacheKey, newState)
      setState(newState)
    } else {
      // 全源试过均失败，降级为字母头像；清除落盘记录，下次开机自动重试
      const failState = { src: '', fallbackIndex: nextIndex }
      if (cacheKey) {
        faviconCache.set(cacheKey, failState)
        try { localStorage.removeItem(CACHE_PREFIX + cacheKey) } catch {}
      }
      setState(failState)
    }
  }

  if (state.fallbackIndex >= candidates.length || !state.src) {
    return <LetterAvatar title={title} className={className} />
  }

  return (
    <img
      src={state.src}
      alt={`${title} icon`}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      decoding="async"
    />
  )
}
