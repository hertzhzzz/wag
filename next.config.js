// Factory Wiki: CSP includes img.alicdn.com for evidence images
/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const cleanupRedirects = require('./redirects')
const {
  shouldNoindexNonProduction,
  NON_PRODUCTION_ROBOTS_TAG,
} = require('./lib/noindex-env.cjs')

// Build-time env on Vercel: production | preview | development.
// Host-based *.vercel.app guard lives in proxy.ts (request-time).
const buildTimeNoindex = shouldNoindexNonProduction({
  vercelEnv: process.env.VERCEL_ENV,
})

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]

const cspDev =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.facebook.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.winningadventure.com.au https://images.unsplash.com https://images.pexels.com https://cdn.pixabay.com https://www.facebook.com https://connect.facebook.net https://img.alicdn.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.google-analytics.com https://www.googleadservices.com; media-src 'self' https://pub-543b90f0e56147e5bdd93d5e7cc36c10.r2.dev; frame-src 'self' https://www.facebook.com https://www.google.com https://maps.google.com https://maps.gstatic.com; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://www.googleadservices.com https://ad.doubleclick.net https://www.google.com https://www.facebook.com https://connect.facebook.net;"

const cspProd =
  "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.facebook.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.winningadventure.com.au https://images.unsplash.com https://images.pexels.com https://cdn.pixabay.com https://www.facebook.com https://connect.facebook.net https://img.alicdn.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.google-analytics.com https://www.googleadservices.com; media-src 'self' https://pub-543b90f0e56147e5bdd93d5e7cc36c10.r2.dev; frame-src 'self' https://www.facebook.com https://www.google.com https://maps.google.com https://maps.gstatic.com; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://www.googleadservices.com https://ad.doubleclick.net https://www.google.com https://www.facebook.com https://connect.facebook.net;"

const nextConfig = {
  transpilePackages: ['@builder.io/partytown'],
  reactStrictMode: true,
  async redirects() {
    return [
      ...cleanupRedirects,
      // China Sourcing Agent commercial root + legacy equity transfer
      {
        source: '/china-sourcing-agent-australia',
        destination: '/china-sourcing-agent',
        permanent: true,
      },
      {
        source: '/article/china-sourcing-agent',
        destination: '/china-sourcing-agent',
        permanent: true,
      },
      {
        source: '/china-sourcing-guide-australia',
        destination: '/article/importing-from-china-australia-guide',
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
        source: '/bulk-procurement-china-guide',
        destination: '/article/bulk-procurement-china-guide',
        permanent: true,
      },
      {
        source: '/china-business-travel-guide-2026',
        destination: '/article/visiting-chinese-factories-australian-business-checklist',
        permanent: true,
      },
      {
        source: '/australia-import-tips',
        destination: '/article/importing-from-china-australia-guide',
        permanent: true,
      },
      {
        source: '/how-to-import-from-china',
        destination: '/article/importing-from-china-australia-guide',
        permanent: true,
      },
      // Content cleanup 2026-06-30 — 6 off-topic/outdated articles removed, 301 → best match
      {
        source: '/article/av-equipment-procurement-china',
        destination: '/article/bulk-procurement-china-guide',
        permanent: true,
      },
      {
        source: '/article/ato-china-import-compliance-2026',
        destination: '/article/importing-from-china-australia-guide',
        permanent: true,
      },
      {
        source: '/article/australia-import-tips',
        destination: '/article/importing-from-china-australia-guide',
        permanent: true,
      },
      {
        source: '/article/china-business-travel-guide-2026',
        destination: '/article/visiting-chinese-factories-australian-business-checklist',
        permanent: true,
      },
      {
        source: '/article/china-ev-market-decline-supply-chain-guide',
        destination: '/article/china-sourcing-risks',
        permanent: true,
      },
      {
        source: '/article/how-to-plan',
        destination: '/article/visiting-chinese-factories-australian-business-checklist',
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
        source: '/article/china-business-sourcing-tour',
        destination: '/article/china-factory-tour-guide',
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
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'img.alicdn.com',
      },
    ],
  },
  async headers() {
    // Build-time: Vercel preview deployments must not be indexed (complements proxy.ts host checks).
    const previewNoIndex =
      process.env.VERCEL_ENV === 'preview'
        ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]
        : []

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
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.facebook.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.winningadventure.com.au https://images.unsplash.com https://images.pexels.com https://cdn.pixabay.com https://www.facebook.com https://connect.facebook.net https://img.alicdn.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.google-analytics.com https://www.googleadservices.com; media-src 'self' https://pub-543b90f0e56147e5bdd93d5e7cc36c10.r2.dev; frame-src 'self' https://www.facebook.com https://www.google.com https://maps.google.com https://maps.gstatic.com; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://www.googleadservices.com https://ad.doubleclick.net https://www.google.com https://www.facebook.com https://connect.facebook.net;" },
          ...previewNoIndex,
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
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.facebook.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.winningadventure.com.au https://images.unsplash.com https://images.pexels.com https://cdn.pixabay.com https://www.facebook.com https://connect.facebook.net https://img.alicdn.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.google-analytics.com https://www.googleadservices.com; media-src 'self' https://pub-543b90f0e56147e5bdd93d5e7cc36c10.r2.dev; frame-src 'self' https://www.facebook.com https://www.google.com https://maps.google.com https://maps.gstatic.com; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://www.googleadservices.com https://ad.doubleclick.net https://www.google.com https://www.facebook.com https://connect.facebook.net;" },
          ...previewNoIndex,
        ]
      }
    ]
  }
}

module.exports = withBundleAnalyzer(nextConfig)
