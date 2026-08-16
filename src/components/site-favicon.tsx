'use client'

import { useState, useEffect } from 'react'
import { LetterAvatar } from './letter-avatar'

interface SiteFaviconProps {
  title: string
  href?: string
  icon?: string
  useDefaultIcon?: boolean
  className?: string
}

function getDomain(url?: string): string {
  if (!url) return ''
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    return parsed.hostname
  } catch {
    return ''
  }
}

// 图标源链路（v2）：favicon.im 免墙高速 → 域名直连 favicon.ico → 字母头像
// 仅"加载成功"的结果才持久化到 localStorage；失败状态只留在内存，
// 网络恢复后重开应用自动重试，杜绝失败状态被永久缓存成"死亡图标"。
// 缓存键带 v2 版本号：一次性作废旧版被污染的失败缓存。
const CACHE_PREFIX = 'ai_fav_cache_v2_'
const faviconCache = new Map<string, { src: string; fallbackIndex: number }>()

export function SiteFavicon({ title, href, icon, useDefaultIcon, className }: SiteFaviconProps) {
  const domain = getDomain(href)
  const cacheKey = icon && icon.trim() !== '' && !useDefaultIcon ? `icon:${icon}` : domain

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
    let initialSrc = ''
    if (icon && icon.trim() !== '' && !useDefaultIcon) {
      initialSrc = icon
    } else if (domain) {
      initialSrc = `https://favicon.im/${domain}`
    }
    return { src: initialSrc, fallbackIndex: 0 }
  })

  useEffect(() => {
    if (cacheKey && faviconCache.has(cacheKey)) {
      const cached = faviconCache.get(cacheKey)!
      if (cached.src !== state.src || cached.fallbackIndex !== state.fallbackIndex) {
        setState(cached)
      }
    }
  }, [cacheKey, state.src, state.fallbackIndex])

  const handleLoad = () => {
    if (!cacheKey || !state.src) return
    const current = { src: state.src, fallbackIndex: state.fallbackIndex }
    faviconCache.set(cacheKey, current)
    try { localStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify(current)) } catch {}
  }

  const handleError = () => {
    // 降级链：favicon.im → 域名直连 favicon.ico → 字母头像；失败只留内存、并清除落盘记录
    const nextIndex = state.fallbackIndex + 1
    const nextSrc = nextIndex === 1 && domain ? `https://${domain}/favicon.ico` : ''
    const newState = { src: nextSrc, fallbackIndex: nextSrc ? nextIndex : 2 }
    if (cacheKey) {
      faviconCache.set(cacheKey, newState)
      try { localStorage.removeItem(CACHE_PREFIX + cacheKey) } catch {}
    }
    setState(newState)
  }

  if (state.fallbackIndex >= 2 || !state.src) {
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
