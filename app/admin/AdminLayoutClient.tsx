'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Button } from "@/registry/new-york/ui/button"
import { ScrollArea } from "@/registry/new-york/ui/scroll-area"
import { Separator } from "@/registry/new-york/ui/separator"
import { 
  LayoutDashboard,
  ListTodo,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"
import { cn } from '@/lib/utils'

interface AdminLayoutClientProps {
  children: React.ReactNode
  user: any
}

const menuItems = [
  {
    title: "仪表盘",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "导航管理",
    href: "/admin/navigation",
    icon: ListTodo,
  },
  {
    title: "站点设置",
    href: "/admin/site",
    icon: Settings,
  },
]

export function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="hidden md:block">
      <div className="border-t">
        <div className="bg-background">
          <div className={cn(
            "grid transition-all duration-300",
            isSidebarCollapsed ? "lg:grid-cols-[80px_minmax(0,1fr)]" : "lg:grid-cols-[240px_minmax(0,1fr)]"
          )}>
            <div className="relative hidden lg:block">
              <div className={cn(
                "fixed top-0 bottom-0 z-20 flex flex-col transition-all duration-300 bg-background border-r shadow-sm",
                isSidebarCollapsed ? "w-[80px]" : "w-[240px]"
              )}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -right-3 top-[40%] translate-y-[-50%] z-50 border shadow-md bg-background rounded-full hover:bg-muted"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                >
                  {isSidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>

                <div className="flex-1 overflow-hidden">
                  <div className="px-3 py-4">
                    <div className="mb-6">
                      <Link href="/admin" className={cn(
                        "flex items-center gap-3 px-2",
                        isSidebarCollapsed ? "justify-center" : "justify-start"
                      )}>
                        <img 
                          src="/assets/images/alogo.png" 
                          alt="Logo" 
                          className={cn(
                            "h-8 w-auto rounded-md",
                            isSidebarCollapsed && "mx-auto"
                          )}
                        />
                        {!isSidebarCollapsed && (
                          <span className="font-bold text-xl tracking-tight">
                            NavSphere
                          </span>
                        )}
                      </Link>
                    </div>

                    <Separator className="mb-4" />
                    
                    <ScrollArea className="h-[calc(100vh-10rem)]">
                      <div className="py-1">
                        <div className="px-3">
                          {!isSidebarCollapsed && (
                            <h2 className="mb-3 px-2 text-lg font-semibold tracking-tight">
                              管理菜单
                            </h2>
                          )}
                          <nav className="grid gap-[2px]">
                            {menuItems.map((item) => (
                              <Link key={item.href} href={item.href}>
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-start h-8",
                                    "hover:bg-muted transition-all duration-200",
                                    pathname === item.href && [
                                      "bg-muted",
                                      "hover:bg-muted/80",
                                      "font-medium"
                                    ],
                                    !pathname.startsWith(item.href) && "text-muted-foreground",
                                    !isSidebarCollapsed && "px-4"
                                  )}
                                  size="sm"
                                >
                                  <item.icon className={cn(
                                    "h-4 w-4 shrink-0",
                                    pathname === item.href 
                                      ? "text-foreground" 
                                      : "text-muted-foreground",
                                    !isSidebarCollapsed && "mr-3"
                                  )} />
                                  {!isSidebarCollapsed && (
                                    <span className="text-sm">
                                      {item.title}
                                    </span>
                                  )}
                                </Button>
                              </Link>
                            ))}
                          </nav>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                <div className="p-3 mt-auto">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      "hover:bg-destructive/10 text-muted-foreground hover:text-destructive",
                      isSidebarCollapsed && "justify-center",
                      !isSidebarCollapsed && "px-4"
                    )}
                    onClick={() => signOut({ callbackUrl: '/' })}
                    size="sm"
                  >
                    <LogOut className={cn(
                      "h-4 w-4 shrink-0",
                      !isSidebarCollapsed && "mr-3"
                    )} />
                    {!isSidebarCollapsed && (
                      <span className="text-sm">退出登录</span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <main className="min-h-screen">
              <div className="p-6">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
} 