import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'egbnfonqeqseuptbfkyp.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'love.kyber.kr',
      },
      {
        protocol: 'https',
        hostname: 'k-tea.love',
      },
    ],
  },
}

export default nextConfig
