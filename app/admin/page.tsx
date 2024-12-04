'use client'
export const runtime = 'edge'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutDashboard, Settings, Menu, Database } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const dashboardItems = [
    {
      title: '站点设置',
      icon: Settings,
      href: '/admin/site',
      description: '管理网站的基本信息，如标题、描述、Logo等'
    },
    {
      title: '导航管理',
      icon: Menu,
      href: '/admin/navigation',
      description: '管理网站的导航菜单分类和子项目'
    },
    {
      title: '资源管理',
      icon: Database,
      href: '/admin/resources',
      description: '管理网站的资源内容和分类'
    }
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">控制台</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dashboardItems.map(item => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center space-x-4">
                <item.icon className="w-8 h-8 text-muted-foreground" />
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
} 