'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { signOut } from 'next-auth/react'
import { Icons } from '@/components/icons'
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useState } from 'react'

const menuItems = [
  {
    title: '控制台',
    icon: Icons.dashboard,
    href: '/admin'
  },
  {
    title: '站点设置',
    icon: Icons.settings,
    href: '/admin/site'
  },
  {
    title: '导航管理',
    icon: Icons.menu,
    href: '/admin/navigation'
  },
  {
    title: '资源管理',
    icon: Icons.database,
    href: '/admin/resources'
  }
]

interface AdminLayoutClientProps {
  children: React.ReactNode
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
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
                "fixed top-0 bottom-0 z-20 flex flex-col transition-all duration-300 bg-background border-r",
                isSidebarCollapsed ? "w-[80px]" : "w-[240px]"
              )}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -right-3 top-[40%] translate-y-[-50%] z-50 border shadow-md bg-background"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                >
                  {isSidebarCollapsed ? (
                    <Icons.chevronRight className="h-4 w-4" />
                  ) : (
                    <Icons.chevronLeft className="h-4 w-4" />
                  )}
                </Button>
                <div className="flex-1 overflow-hidden">
                  <div className="px-3 py-4">
                    <div className="mb-4 space-y-3">
                      <div className={cn(
                        "flex items-center",
                        isSidebarCollapsed ? "justify-center" : "gap-3"
                      )}>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.image || ''} alt={user?.name || 'User'} />
                          <AvatarFallback>
                            <Icons.user className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        {!isSidebarCollapsed && (
                          <div className="space-y-1">
                            <h2 className="text-sm font-semibold">
                              {user?.name || 'User'}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                              {user?.email || ''}
                            </p>
                          </div>
                        )}
                      </div>
                      <Separator />
                    </div>
                    
                    <div className="space-y-1">
                      {!isSidebarCollapsed && (
                        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                          管理菜单
                        </h2>
                      )}
                      <ScrollArea className="h-[calc(100vh-12rem)]">
                        <div className="space-y-1 p-2">
                          {menuItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                              <Button
                                variant={pathname === item.href ? "secondary" : "ghost"}
                                className={cn(
                                  "w-full relative group",
                                  isSidebarCollapsed 
                                    ? "justify-center px-2" 
                                    : "justify-start",
                                  pathname === item.href && [
                                    "bg-primary/10",
                                    "hover:bg-primary/15",
                                    "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                                    "before:h-8 before:w-1",
                                    "before:bg-primary before:rounded-r-md"
                                  ],
                                  "transition-colors"
                                )}
                                size="sm"
                              >
                                <item.icon className={cn(
                                  "h-4 w-4 transition-colors",
                                  pathname === item.href 
                                    ? "text-primary" 
                                    : "text-muted-foreground group-hover:text-primary"
                                )} />
                                {!isSidebarCollapsed && (
                                  <span className={cn(
                                    "ml-2 text-sm transition-colors",
                                    pathname === item.href 
                                      ? "text-foreground font-medium" 
                                      : "text-muted-foreground group-hover:text-foreground"
                                  )}>
                                    {item.title}
                                  </span>
                                )}
                                {isSidebarCollapsed && (
                                  <span className="sr-only">{item.title}</span>
                                )}
                              </Button>
                            </Link>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
                <div className="p-3 mt-auto">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full text-red-600 hover:text-red-600 hover:bg-red-100",
                      isSidebarCollapsed 
                        ? "justify-center px-2" 
                        : "justify-start"
                    )}
                    onClick={() => signOut({ callbackUrl: '/' })}
                    size="sm"
                  >
                    <Icons.logOut className={cn(
                      "h-4 w-4",
                      !isSidebarCollapsed && "mr-2"
                    )} />
                    {!isSidebarCollapsed && "退出登录"}
                    {isSidebarCollapsed && (
                      <span className="sr-only">退出登录</span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className={cn(
              "min-h-screen transition-all duration-300"
            )}>
              <div className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center px-4">
                  <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild className="lg:hidden">
                      <Button variant="ghost" size="icon">
                        <Icons.menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[240px]">
                      <div className="flex flex-col h-full">
                        <div className="p-4 border-b">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user?.image || ''} alt={user?.name || 'User'} />
                              <AvatarFallback>
                                <Icons.user className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h2 className="text-sm font-semibold">
                                {user?.name || 'User'}
                              </h2>
                              <p className="text-xs text-muted-foreground">
                                {user?.email || ''}
                              </p>
                            </div>
                          </div>
                        </div>
                        <ScrollArea className="flex-1 p-4">
                          <div className="space-y-2">
                            {menuItems.map((item) => (
                              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                                <Button
                                  variant={pathname === item.href ? "secondary" : "ghost"}
                                  className="w-full justify-start"
                                  size="sm"
                                >
                                  <item.icon className="mr-2 h-4 w-4" />
                                  {item.title}
                                </Button>
                              </Link>
                            ))}
                          </div>
                        </ScrollArea>
                        <div className="border-t p-4">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-100"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            size="sm"
                          >
                            <Icons.logOut className="mr-2 h-4 w-4" />
                            退出登录
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                  <div className="flex w-full items-center gap-4">
                    <div className="flex-1">
                      <h1 className="text-lg font-semibold">
                        {menuItems.find(item => item.href === pathname)?.title || '控制台'}
                      </h1>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="hidden md:inline-block text-sm text-muted-foreground">
                        欢迎回来，{user?.name || 'User'}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user?.image || ''} alt={user?.name || 'User'} />
                              <AvatarFallback>
                                <Icons.user className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                          <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {user?.name || 'User'}
                              </p>
                              <p className="text-xs leading-none text-muted-foreground">
                                {user?.email || ''}
                              </p>
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer"
                            onClick={() => signOut({ callbackUrl: '/' })}
                          >
                            <Icons.logOut className="mr-2 h-4 w-4" />
                            退出登录
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-6">
                <div className="mx-auto">
                  <ScrollArea className="h-[calc(100vh-8rem)]">
                    <div className="space-y-6">
                      <main>{children}</main>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 