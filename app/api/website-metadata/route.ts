import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { commitFile } from '@/lib/github'

export const runtime = 'edge'

interface WebsiteMetadata {
    title: string
    description: string
    icon: string
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.accessToken) {
            return new Response('Unauthorized', { status: 401 })
        }

        const { url } = await request.json()

        if (!url || !isValidUrl(url)) {
            return NextResponse.json({ error: '请提供有效的网站链接' }, { status: 400 })
        }

        const metadata = await fetchWebsiteMetadata(url)

        // 如果获取到了 favicon，下载并上传到 GitHub
        if (metadata.icon) {
            try {
                const iconUrl = await downloadAndUploadIcon(metadata.icon, session.user.accessToken)
                metadata.icon = iconUrl
            } catch (error) {
                console.warn('Failed to download icon:', error)
                // 如果图标下载失败，保持原始 URL
            }
        }

        return NextResponse.json(metadata)
    } catch (error) {
        console.error('Failed to fetch website metadata:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : '获取网站信息失败' },
            { status: 500 }
        )
    }
}

function isValidUrl(string: string): boolean {
    try {
        new URL(string)
        return true
    } catch (_) {
        return false
    }
}

async function fetchWebsiteMetadata(url: string): Promise<WebsiteMetadata> {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    })

    if (!response.ok) {
        throw new Error(`无法访问网站: ${response.status}`)
    }

    const html = await response.text()

    // 解析 HTML 获取元数据
    const title = extractMetaContent(html, 'title') ||
        extractMetaContent(html, 'og:title') ||
        extractMetaContent(html, 'twitter:title') ||
        new URL(url).hostname

    const description = extractMetaContent(html, 'description') ||
        extractMetaContent(html, 'og:description') ||
        extractMetaContent(html, 'twitter:description') ||
        ''

    // 获取 favicon
    let icon = extractFavicon(html, url)

    return {
        title: title.trim(),
        description: description.trim(),
        icon: icon || ''
    }
}

function extractMetaContent(html: string, name: string): string | null {
    // 匹配 title 标签
    if (name === 'title') {
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
        return titleMatch ? titleMatch[1] : null
    }

    // 匹配 meta 标签
    const patterns = [
        new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i'),
        new RegExp(`<meta[^>]*property=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${name}["']`, 'i')
    ]

    for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match) {
            return match[1]
        }
    }

    return null
}

function extractFavicon(html: string, baseUrl: string): string | null {
    const base = new URL(baseUrl)

    // 尝试从 HTML 中提取 favicon
    const faviconPatterns = [
        /<link[^>]*rel=["']icon["'][^>]*href=["']([^"']*)["']/i,
        /<link[^>]*href=["']([^"']*)["'][^>]*rel=["']icon["']/i,
        /<link[^>]*rel=["']shortcut icon["'][^>]*href=["']([^"']*)["']/i,
        /<link[^>]*href=["']([^"']*)["'][^>]*rel=["']shortcut icon["']/i,
        /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']*)["']/i,
        /<link[^>]*href=["']([^"']*)["'][^>]*rel=["']apple-touch-icon["']/i
    ]

    for (const pattern of faviconPatterns) {
        const match = html.match(pattern)
        if (match) {
            const href = match[1]
            if (href.startsWith('http')) {
                return href
            } else if (href.startsWith('//')) {
                return base.protocol + href
            } else if (href.startsWith('/')) {
                return base.origin + href
            } else {
                return base.origin + '/' + href
            }
        }
    }

    // 如果没有找到，尝试默认的 favicon.ico
    return base.origin + '/favicon.ico'
}

async function downloadAndUploadIcon(iconUrl: string, token: string): Promise<string> {
    try {
        // 下载图标
        const response = await fetch(iconUrl)
        if (!response.ok) {
            throw new Error(`Failed to download icon: ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const binaryData = new Uint8Array(arrayBuffer)

        // 上传到 GitHub
        const { path } = await uploadImageToGitHub(binaryData, token, getFileExtension(iconUrl))
        return path
    } catch (error) {
        console.error('Failed to download and upload icon:', error)
        throw error
    }
}

function getFileExtension(url: string): string {
    try {
        const pathname = new URL(url).pathname
        const extension = pathname.split('.').pop()?.toLowerCase()

        if (extension && ['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico'].includes(extension)) {
            return extension
        }
        return 'png' // 默认扩展名
    } catch {
        return 'png'
    }
}

async function uploadImageToGitHub(binaryData: Uint8Array, token: string, extension: string = 'png'): Promise<{ path: string, commitHash: string }> {
    const owner = process.env.GITHUB_OWNER!
    const repo = process.env.GITHUB_REPO!
    const branch = process.env.GITHUB_BRANCH || 'main'
    const path = `/assets/favicon_${Date.now()}.${extension}`
    const githubPath = 'public' + path

    // Convert Uint8Array to Base64
    const base64String = Buffer.from(binaryData).toString('base64')
    const currentFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${githubPath}?ref=${branch}`

    const response = await fetch(currentFileUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
            message: `Upload favicon ${githubPath}`,
            content: base64String,
            branch: branch,
        }),
    })

    if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to upload image to GitHub:', errorData)
        throw new Error(`Failed to upload image to GitHub: ${errorData.message || 'Unknown error'}`)
    }

    const responseData = await response.json()
    const commitHash = responseData.commit.sha

    return { path, commitHash }
}