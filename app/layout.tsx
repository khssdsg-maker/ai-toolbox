import "@/styles/globals.css"
import { Inter } from 'next/font/google'
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '检查清单 - 投资数据分析工具',
  description: '一站式投资数据分析工具，提供ETF、基金、债券等实时数据和分析',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}


