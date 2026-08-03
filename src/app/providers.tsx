'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@/components/ui/toaster'
import { LanguageProvider } from '@/lib/language-context'
import { ExternalFavoriteListener } from '@/components/external-favorite-listener'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        {children}
        <ExternalFavoriteListener />
        <Toaster />
      </LanguageProvider>
    </SessionProvider>
  )
}

