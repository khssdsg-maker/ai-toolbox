import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from "@/components/ui/toaster"
import type { SiteConfig } from '@/types/site'

const inter = Inter({ subsets: ['latin'] })

async function getSiteInfo(): Promise<SiteConfig> {
  try {
    const res = await fetch('http://localhost:3000/api/home/site')
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
    <html lang="zh" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
      </head>
      <body className={cn(
        'min-h-screen bg-background font-sans antialiased',
        inter.className
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="h-screen flex flex-col">
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
