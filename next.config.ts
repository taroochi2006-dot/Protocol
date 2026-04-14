import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.yimg.com' },
      { protocol: 'https', hostname: 'media.zenfs.com' },
      { protocol: 'https', hostname: 's.yimg.com' },
    ],
  },
}

export default nextConfig
