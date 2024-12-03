export async function commitFile(
  path: string,
  content: string,
  message: string,
  token: string
) {
  const owner = process.env.GITHUB_OWNER!
  const repo = process.env.GITHUB_REPO!
  const branch = process.env.GITHUB_BRANCH || 'main'

  // 获取当前文件信息
  const currentFile = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  ).then(res => res.json())

  // 提交更新
  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString('base64'),
        sha: currentFile.sha,
        branch,
      }),
    }
  ).then(res => {
    if (!res.ok) {
      throw new Error(`Failed to commit file: ${res.statusText}`)
    }
  })
} 