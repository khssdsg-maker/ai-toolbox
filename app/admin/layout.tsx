import { redirect } from 'next/navigation'
import { AdminLayoutClient } from './AdminLayoutClient'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/app/api/auth/[...nextauth]/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
} 