import type { AuthConfig, Session, User } from '@auth/core'
import GitHub from '@auth/core/providers/github'
import type { JWT } from '@auth/core/jwt'

declare module '@auth/core/types' {
  interface Session {
    user: {
      accessToken?: string
    } & User
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    accessToken?: string
  }
}

export const authConfig = {
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
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: '/api/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.accessToken = token.accessToken
      }
      return session
    },
  },
} satisfies AuthConfig 