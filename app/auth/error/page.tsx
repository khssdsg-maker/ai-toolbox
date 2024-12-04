'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-red-600">认证错误</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
        <div className="mt-8">
          <Link
            href="/auth/signin"
            className="block w-full rounded-md bg-black px-4 py-2 text-center text-white hover:bg-gray-800"
          >
            返回登录
          </Link>
        </div>
      </div>
    </div>
  )
} 