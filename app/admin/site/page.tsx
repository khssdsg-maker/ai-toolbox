'use client'
export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Icons } from "@/components/icons"
import type { SiteInfo } from '@/types/site'

const defaultSiteInfo: SiteInfo = {
  basic: {
    title: '编程爱好者网址导航',
    description: '收集国内外优秀设计网站、UI设计资源网站、灵感创意网站、素材资源网站，定时更新分享优质产品设计书签。',
    keywords: '设计导航,设计资源,设计工具,设计素材,设计教程',
  },
  appearance: {
    logo: '/assets/images/logo@2x.png',
    favicon: '/favicon.ico',
    theme: 'system'
  }
}

export default function SiteSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(defaultSiteInfo)
  const { toast } = useToast()

  useEffect(() => {
    fetchSiteInfo()
  }, [])

  const fetchSiteInfo = async () => {
    try {
      const response = await fetch('/api/site')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setSiteInfo(data)
    } catch (error) {
      toast({
        title: '错误',
        description: '加载站点信息失败',
        variant: 'destructive'
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(siteInfo),
      })
      
      if (!response.ok) throw new Error('Failed to save')
      
      toast({
        title: '成功',
        description: '站点信息已保存',
      })
    } catch (error) {
      toast({
        title: '错误',
        description: '保存站点信息失败',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">站点设置</h3>
        <p className="text-sm text-muted-foreground">
          管理网站的基本信息和外观设置
        </p>
      </div>
      <Separator />
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="appearance">外观设置</TabsTrigger>
        </TabsList>
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">网站标题</Label>
                <Input
                  id="title"
                  value={siteInfo.basic.title}
                  onChange={e => setSiteInfo({
                    ...siteInfo,
                    basic: { ...siteInfo.basic, title: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">网站描述</Label>
                <Textarea
                  id="description"
                  value={siteInfo.basic.description}
                  onChange={e => setSiteInfo({
                    ...siteInfo,
                    basic: { ...siteInfo.basic, description: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywords">关键词</Label>
                <Input
                  id="keywords"
                  value={siteInfo.basic.keywords}
                  onChange={e => setSiteInfo({
                    ...siteInfo,
                    basic: { ...siteInfo.basic, keywords: e.target.value }
                  })}
                />
                <p className="text-sm text-muted-foreground">
                  多个关键词请用英文逗号分隔
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="w-[120px] bg-blue-500 hover:bg-blue-600"
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Icons.save className="mr-2 h-4 w-4" />
                    保存
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>外观设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo 地址</Label>
                <div className="flex space-x-2">
                  <Input
                    id="logo"
                    value={siteInfo.appearance.logo}
                    onChange={e => setSiteInfo({
                      ...siteInfo,
                      appearance: { ...siteInfo.appearance, logo: e.target.value }
                    })}
                  />
                  <Button variant="outline" size="icon">
                    <Icons.upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="favicon">Favicon 地址</Label>
                <div className="flex space-x-2">
                  <Input
                    id="favicon"
                    value={siteInfo.appearance.favicon}
                    onChange={e => setSiteInfo({
                      ...siteInfo,
                      appearance: { ...siteInfo.appearance, favicon: e.target.value }
                    })}
                  />
                  <Button variant="outline" size="icon">
                    <Icons.upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="w-[120px] bg-blue-500 hover:bg-blue-600"
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Icons.save className="mr-2 h-4 w-4" />
                    保存
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 