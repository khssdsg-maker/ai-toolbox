'use client'

import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Button } from '@/registry/new-york/ui/button'
import Link from 'next/link'
import { SiteFavicon } from './site-favicon'

interface SiteItem {
  name: string
  url: string
  desc: string
}

// 国内直连工具（实测可访问，速度快）
const CN_SITES: SiteItem[] = [
  { name: '站长工具', url: 'https://tool.chinaz.com', desc: '老牌综合工具站：Ping、端口扫描、DNS 查询、HTTP 状态检测、编码转换一应俱全' },
  { name: 'ITDOG', url: 'https://www.itdog.cn', desc: '多地 Ping、网站测速、路由追踪、DNS 查询与防火墙检测，国内开发者首选' },
  { name: 'Boce 波测', url: 'https://www.boce.com', desc: '网站测速、HTTP 状态监测、Ping 检测、DNS 解析诊断' },
  { name: 'IP138', url: 'https://www.ip138.com', desc: '老牌 IP 归属地查询，支持手机号归属地、身份证与邮编查询' },
  { name: '爱站工具', url: 'https://tools.aizhan.com', desc: '站长综合工具：SEO 查询、IP 反查、备案信息、Whois 查询' },
  { name: 'IPIP.NET', url: 'https://www.ipip.net', desc: '专业 IP 地理位置数据库，IP 归属、路由追踪与网络地图' },
]

// 国际优质工具（部分需要科学上网）
const GLOBAL_SITES: SiteItem[] = [
  { name: 'MXToolbox', url: 'https://mxtoolbox.com', desc: 'DNS、邮件黑名单、HTTP/SSL 综合诊断，支持 100+ 项网络检测' },
  { name: 'DNSChecker', url: 'https://dnschecker.org', desc: '全球 DNS 传播状态查询，覆盖 A/AAAA/MX/TXT/NS 等全部记录类型' },
  { name: 'Ping.pe', url: 'https://ping.pe', desc: '全球数十个节点同时 Ping / TCP 端口连通性检测' },
  { name: 'YouGetSignal', url: 'https://www.yougetsignal.com/tools/open-ports/', desc: '在线检测本机或远程主机的端口开放状态' },
]

function SiteCard({ site }: { site: SiteItem }) {
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-card border border-border/40 rounded-xl p-5 transition-all duration-200 hover:border-border/80 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3 mb-3">
        <SiteFavicon title={site.name} href={site.url} className="w-9 h-9 rounded-lg flex-none" />
        <span className="font-semibold truncate">{site.name}</span>
        <ArrowUpRight className="h-4 w-4 ml-auto flex-none text-muted-foreground/50 transition-colors group-hover:text-primary" />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{site.desc}</p>
    </a>
  )
}

export function ToolsCenter() {
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部 */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="flex items-center gap-4 px-5 sm:px-10 h-14 max-w-6xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              首页
            </Button>
          </Link>
          <h1 className="text-lg font-bold tracking-tight">网络工具</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 sm:px-10 py-8 space-y-10">
        {/* 国内直连 */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-4 px-1">国内直连 · 即点即用</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CN_SITES.map((site) => <SiteCard key={site.url} site={site} />)}
          </div>
        </section>

        {/* 国际服务 */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-4 px-1">国际服务 · 部分需要科学上网</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {GLOBAL_SITES.map((site) => <SiteCard key={site.url} site={site} />)}
          </div>
        </section>
      </div>
    </div>
  )
}
