/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone build for Cloudflare Pages
  // Note: Most routes use 'edge' runtime which is compatible with Cloudflare
  // 只在生产环境使用 standalone 输出（本地开发时禁用，避免CSS编译问题）
  ...(process.env.NODE_ENV === 'production' && process.env.BUILD_STANDALONE === 'true' ? { output: 'standalone' } : {}),
  // 桌面应用打包模式：静态导出
  ...(process.env.BUILD_EXPORT === 'true' ? { output: 'export', trailingSlash: true } : {}),

  // Don't fail build on ESLint warnings
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    ...(process.env.BUILD_EXPORT === 'true' ? { unoptimized: true } : {}),
    domains: [
      'dash.cloudflare.com',
      'www.google.com',
      'ph-static.imgix.net',
      'app.leonardo.ai'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*'
      },
      {
        source: '/auth/:path*',
        destination: '/auth/:path*'
      }
    ]
  },
  // Cloudflare Pages configuration
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost', 'newkit.site']
    },
    optimizePackageImports: ['lucide-react', 'date-fns', 'lodash']
  }
}

module.exports = nextConfig



