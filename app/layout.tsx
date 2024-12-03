import type { Metadata } from 'next'
import './globals.css'
import './styles/navigation.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '编程爱好者网址导航',
  description: '收集国内外优秀设计网站、UI设计资源网站、灵感创意网站、素材资源网站，定时更新分享优质产品设计书签。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
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
      <body className={inter.className}>{children}</body>
    </html>
  )
}


