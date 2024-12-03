/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  webpack: (config, { isServer }) => {
    // 为所有构建添加 polyfills
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      buffer: require.resolve('buffer/'),
      url: require.resolve('url/'),
      util: require.resolve('util/'),
      querystring: require.resolve('querystring'),
      fs: false,
      path: false,
      os: false,
      net: false,
      tls: false,
      child_process: false,
      http2: false,
      process: false,
      module: false,
      dns: false,
      zlib: false
    }

    // 添加必要的 externals
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        {
          'utf-8-validate': 'commonjs utf-8-validate',
          'bufferutil': 'commonjs bufferutil',
          'encoding': 'commonjs encoding'
        }
      ]
    }

    // 禁用特定模块
    config.resolve.alias = {
      ...config.resolve.alias,
      'openid-client': false,
      'oauth': false,
      'oauth2': false
    }

    return config
  }
}

module.exports = nextConfig

