'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/registry/new-york/ui/button"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import { Icons } from "@/components/icons"
import { Input } from "@/registry/new-york/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/registry/new-york/ui/dialog"

interface Site {
  id: string
  name: string
  url: string
  description?: string
  createdAt: string
  updatedAt: string
}

export default function SiteListPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [sites, setSites] = useState<Site[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSites()
  }, [])

  const fetchSites = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/sites')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setSites(data)
    } catch (error) {
      toast({
        title: "错误",
        description: "获取数据失败",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            站点管理
          </h2>
          <p className="text-sm text-muted-foreground">
            管理所有站点列表
          </p>
        </div>
        <Button onClick={() => router.push('/admin/sitelist/new')}>
          <Icons.plus className="mr-2 h-4 w-4" />
          添加站点
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="搜索站点..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Icons.loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : filteredSites.length > 0 ? (
        <div className="grid gap-4">
          {filteredSites.map((site) => (
            <div
              key={site.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:border-primary/50 transition-colors"
            >
              <div className="space-y-1">
                <h3 className="font-medium">{site.name}</h3>
                <p className="text-sm text-muted-foreground">{site.url}</p>
                {site.description && (
                  <p className="text-sm text-muted-foreground">{site.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => window.open(site.url, '_blank')}
                  title="访问站点"
                >
                  <Icons.globe className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => router.push(`/admin/sitelist/${site.id}`)}
                  title="编辑"
                >
                  <Icons.pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          {sites.length === 0 ? "暂无站点" : "未找到匹配的站点"}
        </div>
      )}
    </div>
  )
} 