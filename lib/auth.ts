import { getServerSession } from 'next-auth'
import { authConfig } from '@/app/api/auth/[...nextauth]/auth'

export async function auth() {
  return await getServerSession(authConfig)
}