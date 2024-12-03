import NextAuth, { AuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:org repo',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      if (account?.provider === 'github') {
        try {
          const res = await fetch('https://api.github.com/user/orgs', {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
            },
          })
          const orgs = await res.json()
          
          if (!Array.isArray(orgs)) {
            console.error('Failed to fetch organizations:', orgs)
            return false
          }

          return orgs.some(org => org.login === process.env.GITHUB_ORG)
        } catch (error) {
          console.error('Error checking organization membership:', error)
          return false
        }
      }
      return false
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.accessToken = token.accessToken as string
      }
      return session
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 