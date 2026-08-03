'use client'

import { useLanguage } from '@/lib/language-context'
import { Button } from '@/registry/new-york/ui/button'
import { Languages } from 'lucide-react'

// 中英文切换按钮
export function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="hover:bg-accent hover:text-accent-foreground"
      onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      aria-label={t('切换语言', 'Switch Language')}
      title={t('切换语言', 'Switch Language')}
    >
      <span className="text-sm font-medium">
        {locale === 'zh' ? 'EN' : '中'}
      </span>
    </Button>
  )
}
