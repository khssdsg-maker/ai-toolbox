import { redirect } from 'next/navigation'
import { AdminLayoutClient } from './AdminLayoutClient'
import { getSession } from '@auth/core'
import { authConfig } from './auth'

export const runtime = 'edge'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession(authConfig)

  if (!session) {
    redirect('/api/auth/signin')
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
} 