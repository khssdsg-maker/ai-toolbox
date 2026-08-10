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

export function SiteFavicon({ title, href, icon, useDefaultIcon, className }: SiteFaviconProps) {
  const [imgSrc, setImgSrc] = useState<string>('')
  const [fallbackIndex, setFallbackIndex] = useState<number>(0)

  const domain = getDomain(href)

  useEffect(() => {
    setFallbackIndex(0)
    if (icon && icon.trim() !== '' && !useDefaultIcon) {
      setImgSrc(icon)
    } else if (domain) {
      setImgSrc(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`)
    } else {
      setImgSrc('')
    }
  }, [icon, href, useDefaultIcon, domain])

  const handleError = () => {
    if (fallbackIndex === 0 && domain) {
      setFallbackIndex(1)
      setImgSrc(`https://icon.horse/icon/${domain}`)
    } else if (fallbackIndex === 1 && domain) {
      setFallbackIndex(2)
      setImgSrc(`https://unavatar.io/${domain}`)
    } else {
      setFallbackIndex(3)
    }
  }

  if (fallbackIndex >= 3 || !imgSrc) {
    return <LetterAvatar title={title} className={className} />
  }

  return (
    <img
      src={imgSrc}
      alt={`${title} icon`}
      className={className}
      onError={handleError}
    />
  )
}
