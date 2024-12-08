import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  // ... 其他配置
}

const handler = NextAuth(authOptions)

// 正确的导出方式
export const GET = handler
export const POST = handler