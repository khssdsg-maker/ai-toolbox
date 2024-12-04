'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import Image from 'next/image'
import { useState } from 'react'

export default function SignIn() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      await signIn('github', {
        callbackUrl: callbackUrl || '/admin',
        redirect: true
      })
    } catch (error) {
      console.error('登录失败:', error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-16">
            <Image
              src="/assets/images/logo@2x.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        
          <p className="text-sm text-muted-foreground">
            使用 GitHub 账号登录以访问管理功能
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleSignIn}
            className="w-full bg-[#24292F] hover:bg-[#24292F]/90 text-white rounded"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
                登录中...
              </>
            ) : (
              <>
                <Icons.gitHub className="mr-2 h-5 w-5" />
                使用 GitHub 登录
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                安全认证
              </span>
            </div>
          </div>

          <p className="px-8 text-center text-sm text-muted-foreground">
            通过登录，即表示您同意我们的{" "}
            <a
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              服务条款
            </a>{" "}
            和{" "}
            <a
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              隐私政策
            </a>
            。
          </p>
        </div>
      </div>
    </div>
  )
} 