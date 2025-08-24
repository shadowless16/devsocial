/** @type {import('next').NextConfig} */
const nextConfig = {
  // Faster builds
  swcMinify: true,
  compiler: {
    removeConsole: false,
  },
  
  // Reduce bundle analysis
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Faster development builds
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
    
    return config
  },
  
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

export default nextConfig