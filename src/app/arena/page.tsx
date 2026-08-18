import { Metadata } from 'next/types'
import { ArenaContent } from '@/components/arena-content'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'AI 大模型分屏对比台 - AI万能工具箱',
  description: '多模型双栏分屏即时对比工作台：DeepSeek、ChatGPT、Kimi、Claude、通义千问等一键同步对比提问',
  keywords: 'AI对比,大模型对比,DeepSeek,ChatGPT,Kimi,Claude,分屏,Prompt',
}

export default function ArenaPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">正在加载 AI 对比工作台...</div>}>
      <ArenaContent />
    </Suspense>
  )
}
