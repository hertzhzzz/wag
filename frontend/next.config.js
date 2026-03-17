/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['react-globe.gl', 'three-globe', 'globe.gl'],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

module.exports = nextConfig
