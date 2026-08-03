'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// 语言类型：中文 或 英文
export type Locale = 'zh' | 'en'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  // 翻译函数：传入中文和英文，根据当前语言返回对应文字
  t: (zh: string, en: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'zh',
  setLocale: () => {},
  t: (zh) => zh,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh')

  // 从浏览器本地存储读取上次的语言选择
  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale
    if (saved === 'zh' || saved === 'en') {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  // 翻译函数
  const t = (zh: string, en: string) => {
    return locale === 'zh' ? zh : en
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// 让任何组件都能方便地获取当前语言
export function useLanguage() {
  return useContext(LanguageContext)
}
