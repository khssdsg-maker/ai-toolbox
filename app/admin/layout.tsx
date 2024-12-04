export const runtime = 'edge'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminLayoutClient } from './AdminLayoutClient'
import { Toaster } from "@/components/ui/toaster"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <>
      <AdminLayoutClient>{children}</AdminLayoutClient>
      <Toaster />
    </>
  )
} 