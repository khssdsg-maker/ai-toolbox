import "@/styles/globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from '@/components/providers'
import type { Metadata } from 'next'
import Script from 'next/script'
import { Manrope, Noto_Serif_SC } from 'next/font/google'

// 独特的字体组合：Manrope(英文/数字) + Noto Serif SC(中文标题，宋体有杂志感)
const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
})

const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
  variable: '--font-serif-sc',
})

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
    <html lang="zh-CN" suppressHydrationWarning className={cn(manrope.variable, notoSerifSC.variable)}>
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
            {children}
          </Providers>
</ThemeProvider>
      </body>
    </html>
  )
}

