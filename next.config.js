/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  transpilePackages: ['@builder.io/partytown'],
  reactStrictMode: true,
  async redirects() {
    return [
      // Blog slug redirects
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
      {
        protocol: 'https',
        hostname: 'img.alicdn.com',
      },
    ],
  },
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/:path*',
          headers: [
            { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.winningadventure.com.au https://images.unsplash.com https://www.facebook.com https://connect.facebook.net https://img.alicdn.com; media-src 'self' https://pub-543b90f0e56147e5bdd93d5e7cc36c10.r2.dev; frame-src 'self' https://www.facebook.com https://www.google.com https://maps.google.com https://maps.gstatic.com; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net;" }
          ]
        }
      ]
    }
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.winningadventure.com.au https://images.unsplash.com https://www.facebook.com https://connect.facebook.net; frame-src 'self' https://www.facebook.com https://www.google.com https://maps.google.com https://maps.gstatic.com; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net;" }
        ]
      }
    ]
  }
}

module.exports = withBundleAnalyzer(nextConfig)
