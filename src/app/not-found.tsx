'use client'

import Link from 'next/link'
import { Button } from "@/registry/new-york/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <h2 className="text-5xl font-bold text-primary/20 mb-3">404</h2>
      <p className="text-lg text-muted-foreground mb-8">页面不存在</p>
      <Button asChild variant="default">
        <Link href="/">
          返回首页
        </Link>
      </Button>
    </div>
  )
}
