'use client'

import { useState } from 'react'
import { ArrowLeft, Globe, Server, Activity, Plug, Link2, UserCircle } from 'lucide-react'
import { Button } from '@/registry/new-york/ui/button'
import Link from 'next/link'

const TOOLS = [
  { id: 'ip', name: 'IP 查询', desc: '查看你的公网 IP 地址', icon: Globe },
  { id: 'dns', name: 'DNS 查询', desc: '查询域名 DNS 记录', icon: Server },
  { id: 'http', name: 'HTTP 状态检测', desc: '检测网站 HTTP 状态码', icon: Activity },
  { id: 'port', name: '端口检测', desc: '检测远程端口是否开放', icon: Plug },
  { id: 'url', name: 'URL 解析', desc: '拆解 URL 的各个部分', icon: Link2 },
  { id: 'ua', name: 'UA 解析', desc: '解析 User Agent 信息', icon: UserCircle },
] as const

type ToolId = typeof TOOLS[number]['id']

export function ToolsCenter() {
  const [activeTool, setActiveTool] = useState<ToolId>('ip')

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="flex items-center gap-4 px-5 sm:px-10 h-14 max-w-6xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              首页
            </Button>
          </Link>
          <h1 className="text-lg font-bold tracking-tight">网络工具箱</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 sm:px-10 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            const isActive = activeTool === tool.id
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all duration-200 border ${isActive ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-card border-border/40 hover:border-border/70 hover:bg-muted/50 text-foreground'}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium leading-tight">{tool.name}</span>
              </button>
            )
          })}
        </div>

        <div className="bg-card border border-border/40 rounded-xl p-6 sm:p-8">
          {activeTool === 'ip' && <IpLookup />}
          {activeTool === 'dns' && <DnsLookup />}
          {activeTool === 'http' && <HttpCheck />}
          {activeTool === 'port' && <PortCheck />}
          {activeTool === 'url' && <UrlParser />}
          {activeTool === 'ua' && <UaParser />}
        </div>
      </div>
    </div>
  )
}

// ============ IP 查询 ============
function IpLookup() {
  const [ip, setIp] = useState('')
  const [info, setInfo] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleLookup = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://ipapi.co/json/')
      const data = await res.json()
      setIp(data.ip)
      setInfo({
        '国家': data.country_name,
        '地区': data.region,
        '城市': data.city,
        '运营商': data.org,
        '时区': data.timezone,
        '纬度': String(data.latitude),
        '经度': String(data.longitude),
      })
    } catch {
      setIp('获取失败，请检查网络')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">IP 查询</h2>
      <p className="text-sm text-muted-foreground">查看你的公网 IP 地址和地理位置信息。</p>
      <Button onClick={handleLookup} disabled={loading}>{loading ? '查询中...' : '查询我的 IP'}</Button>
      {ip && (
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
            <span className="text-sm text-muted-foreground">公网 IP：</span>
            <span className="text-lg font-mono font-bold ml-2">{ip}</span>
          </div>
          {Object.keys(info).length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(info).map(([key, val]) => (
                <div key={key} className="flex gap-2 text-sm py-1.5 px-3 rounded bg-muted/20">
                  <span className="text-muted-foreground min-w-[60px]">{key}：</span>
                  <span className="font-medium">{val || '-'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============ DNS 查询 ============
function DnsLookup() {
  const [domain, setDomain] = useState('')
  const [type, setType] = useState('A')
  const [result, setResult] = useState<{ records: unknown[] } | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLookup = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/tools/dns?domain=${encodeURIComponent(domain)}&type=${type}`)
      const data = await res.json()
      if (data.error) { setError(data.error); setResult(null) }
      else setResult(data)
    } catch { setError('查询失败') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">DNS 查询</h2>
      <div className="flex gap-3 flex-wrap">
        <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" className="flex-1 min-w-[200px] h-10 rounded-lg border border-border/60 bg-background px-3 text-sm" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm">
          {['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <Button onClick={handleLookup} disabled={!domain || loading}>{loading ? '查询中...' : '查询'}</Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {result && (
        <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
          <p className="text-sm text-muted-foreground mb-2">{result.records.length} 条 {type} 记录：</p>
          <div className="space-y-1 font-mono text-sm">
            {result.records.map((r, i) => (
              <div key={i} className="py-1">{typeof r === 'string' ? r : JSON.stringify(r)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============ HTTP 状态检测 ============
function HttpCheck() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<{ status: number; statusText: string; responseTime: number; redirected: boolean } | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    setLoading(true)
    setError('')
    try {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`
      const res = await fetch(`/api/tools/http-check?url=${encodeURIComponent(fullUrl)}`)
      const data = await res.json()
      if (data.error) { setError(data.error); setResult(null) }
      else setResult(data)
    } catch { setError('请求失败') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">HTTP 状态检测</h2>
      <p className="text-sm text-muted-foreground">检测网站的 HTTP 状态码和响应时间。</p>
      <div className="flex gap-3">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="example.com" className="flex-1 h-10 rounded-lg border border-border/60 bg-background px-3 text-sm" />
        <Button onClick={handleCheck} disabled={!url || loading}>{loading ? '检测中...' : '检测'}</Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30 text-center">
            <div className={`text-2xl font-bold ${Number(result.status) < 400 ? 'text-green-600' : 'text-red-500'}`}>{result.status}</div>
            <div className="text-xs text-muted-foreground mt-1">状态码</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30 text-center">
            <div className="text-2xl font-bold">{result.responseTime}ms</div>
            <div className="text-xs text-muted-foreground mt-1">响应时间</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30 text-center">
            <div className="text-2xl font-bold">{result.redirected ? '是' : '否'}</div>
            <div className="text-xs text-muted-foreground mt-1">是否重定向</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ 端口检测 ============
function PortCheck() {
  const [host, setHost] = useState('')
  const [port, setPort] = useState('')
  const [result, setResult] = useState<{ open: boolean } | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const protocol = Number(port) === 443 ? 'https' : 'http'
      await fetch(`${protocol}://${host}:${port}`, { signal: controller.signal, mode: 'no-cors' })
      clearTimeout(timeout)
      setResult({ open: true })
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setResult({ open: false })
      } else {
        setResult({ open: false })
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">端口检测</h2>
      <p className="text-sm text-muted-foreground">检测远程主机的端口是否开放（浏览器端检测，有局限性）。</p>
      <div className="flex gap-3">
        <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="example.com" className="flex-1 h-10 rounded-lg border border-border/60 bg-background px-3 text-sm" />
        <input value={port} onChange={(e) => setPort(e.target.value)} placeholder="80" type="number" className="w-24 h-10 rounded-lg border border-border/60 bg-background px-3 text-sm" />
        <Button onClick={handleCheck} disabled={!host || !port || loading}>{loading ? '检测中...' : '检测'}</Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {result && (
        <div className={`p-4 rounded-lg border text-center ${result.open ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <span className={`text-lg font-bold ${result.open ? 'text-green-600' : 'text-red-500'}`}>
            {result.open ? '端口可能开放' : '端口未响应或超时'}
          </span>
          <p className="text-xs text-muted-foreground mt-1">{host}:{port}</p>
        </div>
      )}
    </div>
  )
}

// ============ URL 解析 ============
function UrlParser() {
  const [input, setInput] = useState('')
  const [parts, setParts] = useState<Record<string, string>>({})

  const handleParse = () => {
    try {
      const fullUrl = input.startsWith('http') ? input : `https://${input}`
      const url = new URL(fullUrl)
      setParts({
        '协议': url.protocol.replace(':', ''),
        '主机': url.hostname,
        '端口': url.port || '(默认)',
        '路径': url.pathname,
        '查询参数': url.search || '(无)',
        '锚点': url.hash || '(无)',
        '用户名': url.username || '(无)',
        '密码': url.password || '(无)',
      })
    } catch {
      setParts({ '错误': '无法解析此 URL' })
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">URL 解析</h2>
      <p className="text-sm text-muted-foreground">拆解 URL 的各个组成部分。</p>
      <div className="flex gap-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://example.com/path?q=test#section" className="flex-1 h-10 rounded-lg border border-border/60 bg-background px-3 text-sm" />
        <Button onClick={handleParse} disabled={!input.trim()}>解析</Button>
      </div>
      {Object.keys(parts).length > 0 && (
        <div className="space-y-1">
          {Object.entries(parts).map(([key, val]) => (
            <div key={key} className="flex gap-3 text-sm py-2 px-3 rounded bg-muted/20">
              <span className="text-muted-foreground min-w-[80px] font-medium">{key}</span>
              <span className="font-mono break-all">{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ UA 解析 ============
function UaParser() {
  const [ua, setUa] = useState('')
  const [info, setInfo] = useState<Record<string, string>>({})

  const handleParse = () => {
    const str = ua || navigator.userAgent
    const result: Record<string, string> = {}

    // 浏览器检测
    if (str.includes('Chrome') && !str.includes('Edg')) result['浏览器'] = 'Chrome'
    else if (str.includes('Firefox')) result['浏览器'] = 'Firefox'
    else if (str.includes('Safari') && !str.includes('Chrome')) result['浏览器'] = 'Safari'
    else if (str.includes('Edg')) result['浏览器'] = 'Edge'
    else result['浏览器'] = '未知'

    // 操作系统检测
    if (str.includes('Windows NT 10')) result['操作系统'] = 'Windows 10/11'
    else if (str.includes('Windows')) result['操作系统'] = 'Windows'
    else if (str.includes('Mac OS X')) result['操作系统'] = 'macOS'
    else if (str.includes('Linux')) result['操作系统'] = 'Linux'
    else if (str.includes('Android')) result['操作系统'] = 'Android'
    else if (str.includes('iPhone') || str.includes('iPad')) result['操作系统'] = 'iOS'
    else result['操作系统'] = '未知'

    // 设备类型
    if (/Mobile|Android|iPhone/i.test(str)) result['设备类型'] = '移动端'
    else if (/Tablet|iPad/i.test(str)) result['设备类型'] = '平板'
    else result['设备类型'] = '桌面端'

    result['完整 UA'] = str
    setInfo(result)
  }

  const handleUseCurrent = () => {
    setUa(navigator.userAgent)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">User Agent 解析</h2>
      <div className="flex gap-3">
        <input value={ua} onChange={(e) => setUa(e.target.value)} placeholder="粘贴 User Agent 字符串..." className="flex-1 h-10 rounded-lg border border-border/60 bg-background px-3 text-sm" />
        <Button variant="outline" onClick={handleUseCurrent}>使用当前 UA</Button>
        <Button onClick={handleParse} disabled={!ua.trim()}>解析</Button>
      </div>
      {Object.keys(info).length > 0 && (
        <div className="space-y-1">
          {Object.entries(info).map(([key, val]) => (
            <div key={key} className={`flex gap-3 text-sm py-2 px-3 rounded bg-muted/20 ${key === '完整 UA' ? 'flex-col' : ''}`}>
              <span className="text-muted-foreground min-w-[80px] font-medium">{key}</span>
              <span className="font-mono break-all text-xs">{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

