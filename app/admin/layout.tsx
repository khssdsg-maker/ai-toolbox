'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Settings,
  Menu as MenuIcon,
  Database,
  ChevronDown,
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from 'react'

const menuItems = [
  {
    title: '控制台',
    icon: LayoutDashboard,
    href: '/admin'
  },
  {
    title: '站点设置',
    icon: Settings,
    href: '/admin/site'
  },
  {
    title: '导航管理',
    icon: MenuIcon,
    href: '/admin/navigation'
  },
  {
    title: '资源管理',
    icon: Database,
    href: '/admin/resources'
  }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* 移动端菜单 */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 left-4">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <nav className="flex flex-col gap-2 p-4">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* 桌面端菜单 */}
      <div className="hidden lg:flex">
        <aside className="fixed inset-y-0 left-0 w-64 border-r bg-muted/40">
          <div className="flex h-14 items-center border-b px-4 py-4">
            <h2 className="text-lg font-semibold">后台管理</h2>
          </div>
          <nav className="flex flex-col gap-2 p-4">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>
      </div>

      {/* 主内容区域 */}
      <main className={cn(
        "min-h-screen bg-background",
        "lg:pl-64" // 桌面端左侧留出菜单宽度
      )}>
        <div className="container p-8">
          {children}
        </div>
      </main>
    </div>
  )
} 