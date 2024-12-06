import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Toaster } from "@/components/ui/toaster"
import { ThemeToggle } from '@/components/ThemeToggle'

export const metadata: Metadata = {
  title: 'NavSphere',
  description: '导航管理系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdminOrAuth = children?.toString().includes('/admin') || children?.toString().includes('/auth')

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen">
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


