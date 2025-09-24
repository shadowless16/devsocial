/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aggressive bundle optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      // Exclude heavy libraries from client bundle
      config.externals = config.externals || [];
      if (!isServer) {
        config.externals.push({
          'recharts': 'recharts',
          'react-syntax-highlighter': 'react-syntax-highlighter',
          'framer-motion': 'framer-motion',
          '@react-three/fiber': '@react-three/fiber',
          '@react-three/drei': '@react-three/drei',
          'three': 'three',
          'socket.io-client': 'socket.io-client',
        });
      }

      // Aggressive tree shaking
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        splitChunks: {
          chunks: 'all',
          maxSize: 200000, // 200KB max chunks
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: 'lib',
              priority: 30,
              chunks: 'all',
              maxSize: 150000,
            },
          },
        },
      };
    }
    return config;
  },

  // Minimal experimental features
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Fast builds
  compress: true,
  productionBrowserSourceMaps: false,
  
  // Image optimization
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp'],
  },
};

export default nextConfig;