import { Metadata } from 'next/types'
import { PromptsCenter } from '@/components/prompts-center'

export const metadata: Metadata = {
  title: 'AI 提示词灵感宝典 - AI万能工具箱',
  description: '汇集 GitHub 高 Star 开源与大厂官方实战提示词，覆盖网文小说、AI编程、绘画设计与职场写作。',
}

export default function PromptsPage() {
  return <PromptsCenter />
}
