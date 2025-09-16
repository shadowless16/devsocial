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
      '@': './'
    },
    loaders: {
      '.svg': ['@svgr/webpack'],
    },
  },

  // Experimental features compatible with Turbopack
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      '@radix-ui/react-avatar',
      '@radix-ui/react-button',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip'
    ],
    reactCompiler: false,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
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
