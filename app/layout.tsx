import type { Metadata } from 'next'
import './globals.css'
import './styles/navigation.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: '编程爱好者网址导航',
  description: '收集国内外优秀设计网站、UI设计资源网站、灵感创意网站、素材资源网站，定时更新分享优质产品设计书签。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdminRoute = children?.toString().includes('/admin')

  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
        <link 
          rel="stylesheet" 
          href="/assets/css/fonts/linecons/css/linecons.css"
        />
      </head>
      <body>
        {isAdminRoute ? (
          children
        ) : (
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <ThemeToggle />
            <ScrollToTop />
            <Toaster />
          </ThemeProvider>
        )}
      </body>
    </html>
  )
}


