declare namespace NodeJS {
  interface ProcessEnv {
    GITHUB_ID: string
    GITHUB_SECRET: string
    GITHUB_ORG: string
    GITHUB_OWNER: string
    GITHUB_REPO: string
    GITHUB_BRANCH: string
    NEXTAUTH_URL: string
    NEXTAUTH_SECRET: string
  }
} 