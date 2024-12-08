'use client'

import { useSearchParams } from 'next/navigation'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams?.get('error')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">认证错误</h1>
        <p className="text-muted-foreground mb-4">
          {error || '发生未知错误'}
        </p>
      </div>
    </div>
  )
} 