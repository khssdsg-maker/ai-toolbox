import type { AuthConfig } from '@auth/core'
import GitHub from '@auth/core/providers/github'

export const authConfig: AuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'repo',
        },
      },
    }),
  ],
  callbacks: {
    jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    session({ session, token }) {
      if (session?.user) {
        session.user.accessToken = token.accessToken as string
      }
      return session
    },
  },
} 