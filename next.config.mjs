/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-toast',
      'recharts',
      'react-syntax-highlighter'
    ],
  },

  turbopack: {
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },

  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
    unoptimized: false,
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
