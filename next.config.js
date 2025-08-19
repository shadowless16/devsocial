/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'models.readyplayer.me'],
  },
  
  // Reduce compilation logs
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Optimize for development
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Reduce memory usage
    workerThreads: false,
    cpus: 1,
  },

  // Memory optimization
  webpack: (config, { dev }) => {
    if (dev) {
      config.infrastructureLogging = {
        level: 'error',
      };
      // Reduce memory usage
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
      // Limit parallel processing
      config.parallelism = 1;
    }
    return config;
  },
};

module.exports = nextConfig;