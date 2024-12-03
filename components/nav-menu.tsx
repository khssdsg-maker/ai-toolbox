import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"

export function NavMenu() {
  return (
    <div className="w-full bg-background">
      {/* Primary Navigation */}
      <div className="border-b border-border">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="rounded-full"
                priority
              />
              <span className="text-lg font-semibold">
                检查清单
              </span>
            </Link>
          </div>
          <nav className="flex items-center justify-center space-x-6">
            <Link
              href="#"
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              首页
            </Link>
            <Link
              href="#"
              className="text-sm font-medium transition-colors hover:text-primary/80"
            >
              投资日历
            </Link>
            <Link
              href="#"
              className="text-sm font-medium transition-colors hover:text-primary/80"
            >
              实时数据
            </Link>
          </nav>
          <div className="flex items-center justify-end w-[120px]">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="border-b border-border bg-muted/50">
        <div className="container mx-auto flex h-12 items-center justify-center px-4">
          <nav className="flex items-center space-x-6">
            <Link
              href="#"
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              新股
            </Link>
            <Link
              href="#"
              className="text-sm font-medium transition-colors hover:text-primary/80"
            >
              基金
            </Link>
            <Link
              href="#"
              className="text-sm font-medium transition-colors hover:text-primary/80"
            >
              可转债
            </Link>
            <Link
              href="#"
              className="text-sm font-medium transition-colors hover:text-primary/80"
            >
              港股
            </Link>
            <Link
              href="#"
              className="text-sm font-medium transition-colors hover:text-primary/80"
            >
              ETF
            </Link>
            <Link
              href="#"
              className="text-sm font-medium transition-colors hover:text-primary/80"
            >
              LOF
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}

