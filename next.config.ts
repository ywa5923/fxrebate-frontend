import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
      {
        protocol: 'https',
        hostname: '**.imagedelivery.net',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
    ],
  },
  // Allow production builds to succeed even if there are TypeScript or ESLint errors.
  // Remember to re-enable enforcement when ready.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['framer-motion']
  },
  async rewrites() {
    return [
        // {
        //     source: '/en/etst',
        //     destination: '/en/forex-broker/forex-brokers-reviews',
        //     locale: false // Use `locale: false` so that the prefix matches the desired locale correctly
        // },
        // {
        //     source: '/ro/brokeri/:id/:broker_name',
        //     destination: '/ro/brokers/:id/:broker_name',
        //     locale: false
        // }
    ]
}
};


export default nextConfig

