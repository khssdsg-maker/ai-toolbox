'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/registry/new-york/ui/button'
import { Icons } from '@/components/icons'
import { ScrollArea } from '@/registry/new-york/ui/scroll-area'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("border-r bg-card", className)}>
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Icons.logo className="h-6 w-6" />
          <span>NavSphere</span>
        </Link>
      </div>
      <ScrollArea className="h-[calc(100vh-3.5rem)] px-3 py-2">
        <div className="space-y-4">
          <div className="py-2">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              发现
            </h2>
            <div className="space-y-1">
              <Button
                variant={pathname === "/" ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href="/">
                  <Icons.compass className="mr-2 h-4 w-4" />
                  导航
                </Link>
              </Button>
              <Button
                variant={pathname === "/popular" ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href="/popular">
                  <Icons.star className="mr-2 h-4 w-4" />
                  热门推荐
                </Link>
              </Button>
              <Button
                variant={pathname === "/latest" ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href="/latest">
                  <Icons.clock className="mr-2 h-4 w-4" />
                  最新添加
                </Link>
              </Button>
            </div>
          </div>
          <div className="py-2">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              管理
            </h2>
            <div className="space-y-1">
              <Button
                variant={pathname.startsWith("/admin") ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href="/admin/navigation">
                  <Icons.settings className="mr-2 h-4 w-4" />
                  导航管理
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
