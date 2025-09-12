/** @type {import('next').NextConfig} */
const nextConfig = {
  // Core Turbopack-compatible settings
  swcMinify: true,
  compiler: {
    removeConsole: false,
  },

  // Turbopack-specific configuration
  turbopack: {
    resolveAlias: {
      // Module aliases if needed
    },
  },

  // Experimental features compatible with Turbopack
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    reactCompiler: false,
  },

  // Image configuration
  images: {
    unoptimized: true,
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  // Server configuration
  serverExternalPackages: ['mongoose'],

  // URL rewrites
  async rewrites() {
    return [
      {
        source: '/.well-known/appspecific/:path*',
        destination: '/api/well-known?path=:path*',
      },
    ]
  },
}

export default nextConfig
