/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    // Add Node.js polyfills
    config.resolve.fallback = {
      ...config.resolve.fallback,
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      url: require.resolve('url/')
    }

    // Add externals
    config.externals = [...(config.externals || []), {
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
      'encoding': 'commonjs encoding'
    }]

    return config
  }
}

module.exports = nextConfig

