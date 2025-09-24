/** @type {import('next').NextConfig} */
const nextConfig = {

  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize for production builds
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'radix',
              chunks: 'all',
              priority: 20,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
            },
          },
        },
      };

      // Tree shaking optimizations
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-syntax-highlighter/dist/esm/styles/prism': 'react-syntax-highlighter/dist/cjs/styles/prism',
        'react-syntax-highlighter/dist/esm/languages/prism': 'react-syntax-highlighter/dist/cjs/languages/prism',
      };

      // Exclude heavy dependencies from client bundle if not used
      config.externals = config.externals || [];
      if (!isServer) {
        config.externals.push({
          'three': 'three',
          '@react-three/fiber': '@react-three/fiber',
          '@react-three/drei': '@react-three/drei',
        });
      }
    }

    return config;
  },

  // Image optimization
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Compression
  compress: true,
  
  // Remove unused CSS
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      'recharts'
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    optimizeCss: true,
  },


  
  // Output optimization
  output: 'standalone',
  
  // Disable source maps in production for smaller bundles
  productionBrowserSourceMaps: false,
};

export default nextConfig;