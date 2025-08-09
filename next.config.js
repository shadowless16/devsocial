/** @type {import('next').NextConfig} */
const nextConfig = {
  // Reduce compilation logs
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Optimize for development
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Reduce webpack logs
  webpack: (config, { dev }) => {
    if (dev) {
      config.infrastructureLogging = {
        level: 'error',
      };
    }
    return config;
  },
};

module.exports = nextConfig;