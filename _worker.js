export default {
  async fetch(request, env) {
    // 设置环境变量
    process.env.GITHUB_ID = env.GITHUB_ID
    process.env.GITHUB_SECRET = env.GITHUB_SECRET
    process.env.GITHUB_ORG = env.GITHUB_ORG
    process.env.GITHUB_OWNER = env.GITHUB_OWNER
    process.env.GITHUB_REPO = env.GITHUB_REPO
    process.env.GITHUB_BRANCH = env.GITHUB_BRANCH
    process.env.NEXTAUTH_URL = env.NEXTAUTH_URL
    process.env.NEXTAUTH_SECRET = env.NEXTAUTH_SECRET
    
    return env.ASSETS.fetch(request)
  }
} 