import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import type { DefaultSession, NextAuthConfig, Session } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      accessToken?: string
    } & DefaultSession['user']
  }
  interface JWT {
    accessToken?: string
  }
  interface User {
    accessToken?: string
  }
}

const config = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: { scope: 'repo' }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      const newSession = session as Session
      if (newSession.user) {
        newSession.user.accessToken = token.accessToken as string
      }
      return newSession
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
} satisfies NextAuthConfig

const nextAuth = NextAuth(config)

export const auth = nextAuth.auth
export const signIn = nextAuth.signIn
export const signOut = nextAuth.signOut
export const { GET, POST } = nextAuth.handlers