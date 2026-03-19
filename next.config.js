/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  transpilePackages: ['react-globe.gl', 'three-globe', 'globe.gl'],
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/verify-chinese-supplier',
        destination: '/resources/verify-chinese-supplier',
        permanent: true,
      },
      {
        source: '/china-factory-tour-guide',
        destination: '/resources/china-factory-tour-guide',
        permanent: true,
      },
      {
        source: '/china-sourcing-risks',
        destination: '/resources/china-sourcing-risks',
        permanent: true,
      },
      {
        source: '/china-vs-alibaba',
        destination: '/resources/china-vs-alibaba',
        permanent: true,
      },
      {
        source: '/bulk-procurement-china-guide',
        destination: '/resources/bulk-procurement-china-guide',
        permanent: true,
      },
      {
        source: '/china-business-travel-guide-2026',
        destination: '/resources/china-business-travel-guide-2026',
        permanent: true,
      },
      {
        source: '/australia-import-tips',
        destination: '/resources/australia-import-tips',
        permanent: true,
      },
      {
        source: '/china-supplier-verification',
        destination: '/resources/china-supplier-verification',
        permanent: true,
      },
      {
        source: '/how-to-import-from-china',
        destination: '/resources/how-to-import-from-china',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
        ]
      }
    ]
  }
}

module.exports = withBundleAnalyzer(nextConfig)
