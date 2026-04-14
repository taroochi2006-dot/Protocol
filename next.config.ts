import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.yimg.com' },
      { protocol: 'https', hostname: 'media.zenfs.com' },
      { protocol: 'https', hostname: 's.yimg.com' },
    ],
  },
}

export default nextConfig
