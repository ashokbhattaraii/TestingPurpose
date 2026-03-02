/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Proxy to your backend server
        destination: 'https://testing-purpose-api.vercel.app/api/:path*',
      },
    ]
  },
}

export default nextConfig
