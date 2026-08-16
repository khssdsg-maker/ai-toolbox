import { Metadata } from 'next/types'
import { ToolsCenter } from '@/components/tools-center'

export const metadata: Metadata = {
    title: '网络工具 - AI万能工具箱',
    description: '精选网络工具导航 - 站长工具、ITDOG、IP138、MXToolbox、DNSChecker 等在线 Ping/DNS/IP/端口检测服务',
    keywords: '网络工具,Ping检测,DNS查询,IP查询,端口检测,站长工具',
}

export default function ToolsPage() {
    return <ToolsCenter />
}
