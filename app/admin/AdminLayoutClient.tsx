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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/registry/new-york/ui/avatar"

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
    <div className="hidden md:block h-screen">
      <div className="h-full border-t">
        <div className="h-full bg-background">
          <div className={cn(
            "h-full grid transition-all duration-300",
            isSidebarCollapsed ? "lg:grid-cols-[80px_minmax(0,1fr)]" : "lg:grid-cols-[240px_minmax(0,1fr)]"
          )}>
            <div className="relative hidden lg:block">
              <div className={cn(
                "fixed top-0 bottom-0 z-20 flex flex-col bg-background border-r shadow-sm",
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

                <div className="flex flex-col flex-1">
                  <div className="px-3 py-4">
                    <div className="mb-4">
                      <Link 
                        href="/admin" 
                        className={cn(
                          "flex items-center",
                          isSidebarCollapsed ? "justify-center" : "px-2"
                        )}
                      >
                        <div className={cn(
                          "flex items-center gap-2",
                          isSidebarCollapsed && "flex-col"
                        )}>
                          <div className="relative w-8 h-8 overflow-hidden rounded-md">
                            <img 
                              src="/assets/images/alogo.png" 
                              alt="Logo"
                              className="object-cover"
                            />
                          </div>
                          {!isSidebarCollapsed && (
                            <div className="flex flex-col">
                              <span className="text-lg font-semibold leading-none tracking-tight">
                                NavSphere
                              </span>
                              <span className="text-xs text-muted-foreground mt-1">
                                管理控制台
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>

                    <Separator className="mb-4" />
                    
                    <div className="px-3 flex-1">
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
                </div>

                <div className="p-3 border-t">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "w-full h-auto p-2",
                          "hover:bg-muted transition-colors",
                          isSidebarCollapsed ? "justify-center" : "justify-start"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={user.image || ''} 
                              alt={user.name || ''} 
                            />
                            <AvatarFallback>
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          {!isSidebarCollapsed && (
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-sm font-medium leading-none">
                                {user.name}
                              </span>
                              <div className="flex flex-col gap-[3px] ml-auto mr-1">
                                <div className="h-[3px] w-[2px] rounded-full bg-muted-foreground/40" />
                                <div className="h-[3px] w-[2px] rounded-full bg-muted-foreground/40" />
                                <div className="h-[3px] w-[2px] rounded-full bg-muted-foreground/40" />
                              </div>
                            </div>
                          )}
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      className="w-56" 
                      align={isSidebarCollapsed ? "center" : "start"}
                      side="top"
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => signOut({ callbackUrl: '/' })}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        退出登录
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            <main className="relative lg:pl-[80px] xl:pl-0 h-full">
              <div className="h-full overflow-auto">
                <div className="p-6">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
} 