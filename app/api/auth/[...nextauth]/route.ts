import { Auth } from '@auth/core'
import { authConfig } from './auth'

export const runtime = 'edge'

const req = new Request('http://localhost:3000/api/auth')
const handler = Auth(req, authConfig)
export { handler as GET, handler as POST } 