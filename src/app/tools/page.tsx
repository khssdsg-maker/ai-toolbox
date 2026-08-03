import { Metadata } from 'next/types'
import { ToolsCenter } from '@/components/tools-center'

export const metadata: Metadata = {
    title: '网络工具箱 - AI万能工具箱',
    description: '在线网络工具 - IP查询、DNS查询、HTTP状态检测、端口检测、URL解析、UA解析',
    keywords: 'IP查询,DNS查询,HTTP状态码,端口检测,URL解析',
}

export default function ToolsPage() {
    return <ToolsCenter />
}
