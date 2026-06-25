// Factory Wiki: CSP includes img.alicdn.com for evidence images
/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const cleanupRedirects = require('./redirects')

const nextConfig = {
  transpilePackages: ['@builder.io/partytown'],
  reactStrictMode: true,
  async redirects() {
    return [
      ...cleanupRedirects,
      // ponytail: 3 landing pages merged into homepage — 301 to preserve SEO
      {
        source: '/china-sourcing-agent-australia',
        destination: '/#capabilities',
        permanent: true,
      },
      {
        source: '/visiting-chinese-factories',
        destination: '/#factory-visit',
        permanent: true,
      },
      {
        source: '/china-sourcing-guide-australia',
        destination: '/#capabilities',
        permanent: true,
      },
      // Blog slug redirects
      {
        source: '/verify-chinese-supplier',
        destination: '/article/verify-chinese-supplier',
        permanent: true,
      },
      {
        source: '/china-factory-tour-guide',
        destination: '/article/china-factory-tour-guide',
        permanent: true,
      },
      {
        source: '/china-sourcing-risks',
        destination: '/article/china-sourcing-risks',
        permanent: true,
      },
      {
        source: '/china-vs-alibaba',
        destination: '/article/china-vs-alibaba',
        permanent: true,
      },
      {
        source: '/bulk-procurement-china-guide',
        destination: '/article/bulk-procurement-china-guide',
        permanent: true,
      },
      {
        source: '/china-business-travel-guide-2026',
        destination: '/article/china-business-travel-guide-2026',
        permanent: true,
      },
      {
        source: '/australia-import-tips',
        destination: '/article/australia-import-tips',
        permanent: true,
      },
      {
        source: '/china-supplier-verification',
        destination: '/article/china-supplier-verification',
        permanent: true,
      },
      {
        source: '/how-to-import-from-china',
        destination: '/article/importing-from-china-australia-guide',
        permanent: true,
      },
      // Duplicate article consolidation (301 -> canonical kept article)
      {
        source: '/article/how-to-import-from-china',
        destination: '/article/importing-from-china-australia-guide',
        permanent: true,
      },
      {
        source: '/article/how-to-import-from-china-guide',
        destination: '/article/importing-from-china-australia-guide',
        permanent: true,
      },
      {
        source: '/article/how-to-negotiate-with-chinese-factory',
        destination: '/article/how-to-negotiate-chinese-factory-guide',
        permanent: true,
      },
      {
        source: '/article/byd-company-supply-chain-guide',
        destination: '/article/byd-company-china-supply-chain-guide',
        permanent: true,
      },
      {
        source: '/article/electric-battery-supply-chain-china-sourcing-guide',
        destination: '/article/electric-battery-china',
        permanent: true,
      },
    ]
  },
  images: {
    qualities: [75, 80],
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
            { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.facebook.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.winningadventure.com.au https://images.unsplash.com https://www.facebook.com https://connect.facebook.net https://img.alicdn.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.google-analytics.com https://www.googleadservices.com; media-src 'self' https://pub-543b90f0e56147e5bdd93d5e7cc36c10.r2.dev; frame-src 'self' https://www.facebook.com https://www.google.com https://maps.google.com https://maps.gstatic.com; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://www.googleadservices.com https://ad.doubleclick.net https://www.google.com https://www.facebook.com https://connect.facebook.net;" }
          ]
        }
      ]
    }
    return [
      {
        source: '/client/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ]
      },
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.facebook.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.winningadventure.com.au https://images.unsplash.com https://www.facebook.com https://connect.facebook.net https://img.alicdn.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.google-analytics.com https://www.googleadservices.com; media-src 'self' https://pub-543b90f0e56147e5bdd93d5e7cc36c10.r2.dev; frame-src 'self' https://www.facebook.com https://www.google.com https://maps.google.com https://maps.gstatic.com; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://www.googleadservices.com https://ad.doubleclick.net https://www.google.com https://www.facebook.com https://connect.facebook.net;" }
        ]
      }
    ]
  }
}

module.exports = withBundleAnalyzer(nextConfig)
