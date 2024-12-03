import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { AdminLayoutClient } from './AdminLayoutClient'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
} 