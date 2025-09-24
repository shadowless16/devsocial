/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal config for successful builds
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Image optimization
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp'],
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