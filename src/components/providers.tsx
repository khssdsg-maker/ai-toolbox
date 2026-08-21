'use client'

import { SWRConfig } from 'swr'
import { LanguageProvider } from '@/lib/language-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SWRConfig
        value={{
          provider: () => new Map(),
          revalidateOnFocus: false,
          revalidateOnReconnect: false
        }}
      >
        {children}
      </SWRConfig>
    </LanguageProvider>
  )
}
