/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
      'encoding': 'commonjs encoding',
      'crypto': 'commonjs crypto',
      'http': 'commonjs http',
      'https': 'commonjs https',
      'stream': 'commonjs stream',
      'zlib': 'commonjs zlib',
      'querystring': 'commonjs querystring',
      'punycode': 'commonjs punycode',
      'net': 'commonjs net',
      'tls': 'commonjs tls',
      'assert': 'commonjs assert',
      'util': 'commonjs util',
      'buffer': 'commonjs buffer',
      'url': 'commonjs url'
    })
    return config
  },
}

module.exports = nextConfig

