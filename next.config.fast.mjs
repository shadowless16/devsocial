/** @type {import('next').NextConfig} */
const nextConfig = {
  // Faster builds
  swcMinify: true,
  compiler: {
    removeConsole: false,
  },
  
  // Webpack customizations are attached only when Turbopack is not active.
  
  // Faster page loads
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
    unoptimized: true, // Faster dev builds
  },
}

const isTurbopack = !!(
  process.env.__NEXT_PRIVATE_TURBOPACK === '1' ||
  process.env.NEXT_TURBOPACK === '1' ||
  process.env.__NEXT_PRIVATE_TURBOPACK
)

if (!isTurbopack) {
  // Attach webpack customizations only for webpack runs
  nextConfig.webpack = (config, { dev, isServer }) => {
    if (dev) {
      // Faster development builds
      config.optimization = config.optimization || {}
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }

      // Reduce file watching
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules',
          '**/.git',
          '**/.next',
          '**/coverage',
          '**/jest-cache',
        ],
      }
    }

    if (!isServer) {
      config.resolve = config.resolve || {}
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    return config
  }
}

export default nextConfig