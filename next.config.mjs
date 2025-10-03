/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal config for successful builds
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Image optimization
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'], // Allow WebP/AVIF but don't force
    unoptimized: false, // Keep optimization enabled
    quality: 95, // High quality (default is 75)
    minimumCacheTTL: 60, // Cache for 1 minute minimum
  },

  // Webpack config to handle client-side libraries
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent server-side bundling of client-only libraries
      config.externals = config.externals || [];
      config.externals.push({
        'socket.io-client': 'socket.io-client',
      });
    }
    return config;
  },
};

export default nextConfig;