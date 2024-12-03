import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import type { Session } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      accessToken?: string
    } & Session['user']
  }
}

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  providers: [
    GithubProvider({
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
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.accessToken = token.accessToken as string
      }
      return session
    },
  },
}) 