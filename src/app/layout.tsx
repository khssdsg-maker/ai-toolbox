import "@/styles/globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from '@/components/providers'
import { FloatingSidebar } from '@/components/floating-sidebar'
import { WallpaperBackground } from '@/components/wallpaper-background'
import type { Metadata } from 'next'
import Script from 'next/script'
// Define font CSS variable classes without external Google Font network dependencies
const fontClasses = ""

export const metadata: Metadata = {
  title: {
    default: 'AI万能工具箱',
    template: '%s - AI万能工具箱'
  },
  description: 'AI时代的超级工具箱 - 汇集全球优质AI工具、文件转换、驱动下载、网络工具',
  icons: {
    icon: '/favicon.ico'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.GA_ID

  return (
    <html lang="zh-CN" suppressHydrationWarning className={fontClasses}>
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <WallpaperBackground />
            <FloatingSidebar />
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}

