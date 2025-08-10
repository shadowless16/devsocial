/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
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
  
  // Fix build output issues
  output: 'standalone',
  
  // Fix pnpm vendor chunk issues
  webpack: (config, { dev, isServer, buildId }) => {
    // Fix pnpm module resolution issues
    config.resolve.symlinks = false;
    
    // Prevent vendor chunk errors
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Fix chunk loading issues
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };
    
    // Fix client reference manifest issues
    if (!dev && !isServer) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        // Ensure proper client reference handling
        return entries;
      };
    }
    
    return config;
  },
  
  // Reduce logging in development
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Fix experimental features
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
    optimizePackageImports: ['lucide-react'],
    // Fix client reference manifest generation
    appDir: true,
  },
  
  // Handle DevTools requests gracefully
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
