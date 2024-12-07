import { Metadata } from 'next'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ScrollToTop } from '@/components/ScrollToTop'
import './navigation.css'

export const metadata: Metadata = {
  title: '编程爱好者网址导航',
  description: '收集国内外优秀设计网站、UI设计资源网站、灵感创意网站、素材资源网站，定时更新分享优质产品设计书签。',
}

// 在 head 中添加外部样式表
export const viewport = {
  themeColor: '#4776E6',
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        crossOrigin="anonymous"
      />
      <link 
        rel="stylesheet" 
        href="/assets/css/fonts/linecons/css/linecons.css"
      />
      {children}
      <ThemeToggle />
      <ScrollToTop />
    </>
  )
} 