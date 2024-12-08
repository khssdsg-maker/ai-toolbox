import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import localFont from 'next/font/local'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from "@/components/ui/toaster"
import type { SiteConfig } from '@/types/site'

const fontSans = localFont({
  src: '/fonts/inter-var-latin.woff2',
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: false,
})

async function getSiteInfo(): Promise<SiteConfig> {
  try {
    const res = await fetch('/api/home/site')
    if (!res.ok) {
      throw new Error('Failed to fetch site data')
    }
    return res.json()
  } catch (error) {
    console.error('Error fetching site data:', error)
    return {
      basic: {
        title: 'NavSphere',
        description: '',
        keywords: ''
      },
      appearance: {
        logo: '',
        favicon: '',
        theme: 'system'
      }
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const siteInfo = await getSiteInfo()
  
  return {
    title: {
      default: siteInfo.basic.title,
      template: `%s - ${siteInfo.basic.title}`
    },
    description: siteInfo.basic.description,
    keywords: siteInfo.basic.keywords.split(','),
    icons: {
      icon: siteInfo.appearance.favicon || '/favicon.ico'
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={fontSans.variable} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
