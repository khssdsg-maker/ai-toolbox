export async function getFileContent(path: string) {
  const owner = process.env.GITHUB_OWNER!
  const repo = process.env.GITHUB_REPO!
  const branch = process.env.GITHUB_BRANCH || 'main'

  console.log('GitHub API: Starting getFileContent', {
    path,
    owner,
    repo,
    branch
  })

  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
    console.log('GitHub API: Fetching from:', apiUrl)

    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
        'User-Agent': 'NavSphere',
      },
    })

    console.log('GitHub API: Response status:', response.status)
    console.log('GitHub API: Response headers:', Object.fromEntries(response.headers.entries()))

    if (response.status === 404) {
      console.log('GitHub API: File not found, returning default data')
      if (path.includes('navigation.json')) {
        return {
          navigationItems: []
        }
      }
      if (path.includes('resources.json')) {
        return {
          resourceSections: []
        }
      }
      return {}
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('GitHub API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        headers: Object.fromEntries(response.headers.entries())
      })
      throw new Error(`Failed to fetch file: ${response.statusText} (${errorText})`)
    }

    const data = await response.json()
    console.log('GitHub API: Successfully fetched data:', data)

    // 确保返回的数据格式一致
    if (path.includes('navigation.json')) {
      const result = {
        navigationItems: Array.isArray(data) ? data : data.navigationItems || []
      }
      console.log('GitHub API: Returning navigation data:', result)
      return result
    }
    if (path.includes('resources.json')) {
      const result = {
        resourceSections: Array.isArray(data) ? data : data.resourceSections || []
      }
      console.log('GitHub API: Returning resources data:', result)
      return result
    }

    return data
  } catch (error) {
    console.error('GitHub API: Error in getFileContent:', error)
    // 返回默认数据而不是抛出错误
    if (path.includes('navigation.json')) {
      return {
        navigationItems: []
      }
    }
    if (path.includes('resources.json')) {
      return {
        resourceSections: []
      }
    }
    return {}
  }
}

export async function commitFile(
  path: string,
  content: string,
  message: string,
  token: string
) {
  const owner = process.env.GITHUB_OWNER!
  const repo = process.env.GITHUB_REPO!
  const branch = process.env.GITHUB_BRANCH || 'main'

  try {
    console.log('Committing file:', path)
    // 获取当前文件信息
    const currentFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`

    const currentFileResponse = await fetch(currentFileUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'NavSphere',
      },
    })

    let sha = undefined
    if (currentFileResponse.ok) {
      const currentFile = await currentFileResponse.json()
      sha = currentFile.sha
      console.log('Found existing file with sha:', sha)
    } else {
      console.log('File does not exist, creating new file')
    }

    // 提交更新
    const updateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
    console.log('Updating file at:', updateUrl)

    // 确保内容是有效的 JSON
    let jsonContent = content
    if (typeof content === 'object') {
      jsonContent = JSON.stringify(content, null, 2)
    }

    // 处理中文编码
    const encodedContent = btoa(unescape(encodeURIComponent(jsonContent)))

    const response = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'NavSphere',
      },
      body: JSON.stringify({
        message,
        content: encodedContent,
        sha,
        branch,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('GitHub API error:', error)
      throw new Error(`Failed to commit file: ${error.message}`)
    }

    const result = await response.json()
    console.log('File committed successfully:', result)
    return result
  } catch (error) {
    console.error('Error in commitFile:', error)
    throw error
  }
} 