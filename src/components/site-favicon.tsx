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

// 全局 Favicon 缓存：记录已解析成功或已跌落的域名图标，避免切页/重进时重复加载与闪烁
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
        const stored = localStorage.getItem(`ai_fav_cache_${cacheKey}`)
        if (stored) {
          const parsed = JSON.parse(stored)
          faviconCache.set(cacheKey, parsed)
          return parsed
        }
      } catch {}
    }
    let initialSrc = ''
    if (icon && icon.trim() !== '' && !useDefaultIcon) {
      initialSrc = icon
    } else if (domain) {
      initialSrc = `https://favicon.im/${domain}`
    }
    const initial = { src: initialSrc, fallbackIndex: 0 }
    if (cacheKey && initialSrc) {
      faviconCache.set(cacheKey, initial)
      try { localStorage.setItem(`ai_fav_cache_${cacheKey}`, JSON.stringify(initial)) } catch {}
    }
    return initial
  })

  useEffect(() => {
    if (cacheKey && faviconCache.has(cacheKey)) {
      const cached = faviconCache.get(cacheKey)!
      if (cached.src !== state.src || cached.fallbackIndex !== state.fallbackIndex) {
        setState(cached)
      }
    }
  }, [cacheKey, state.src, state.fallbackIndex])

  const handleError = () => {
    let nextIndex = state.fallbackIndex + 1
    let nextSrc = ''

    if (nextIndex === 1 && domain) {
      nextSrc = `https://api.iowen.cn/favicon/${domain}.png`
    } else if (nextIndex === 2 && domain) {
      nextSrc = `https://${domain}/favicon.ico`
    } else {
      nextIndex = 3
    }

    const newState = { src: nextSrc, fallbackIndex: nextIndex }
    if (cacheKey) {
      faviconCache.set(cacheKey, newState)
      try { localStorage.setItem(`ai_fav_cache_${cacheKey}`, JSON.stringify(newState)) } catch {}
    }
    setState(newState)
  }

  if (state.fallbackIndex >= 3 || !state.src) {
    return <LetterAvatar title={title} className={className} />
  }

  return (
    <img
      src={state.src}
      alt={`${title} icon`}
      className={className}
      onError={handleError}
      loading="lazy"
      decoding="async"
    />
  )
}
