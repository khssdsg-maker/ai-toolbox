'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

export default function SignIn() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')

  const handleSignIn = () => {
    signIn('github', {
      callbackUrl: callbackUrl || '/admin',
      redirect: true
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold">登录</h2>
        </div>
        <div className="mt-8">
          <button
            onClick={handleSignIn}
            className="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            使用 GitHub 登录
          </button>
        </div>
      </div>
    </div>
  )
} 