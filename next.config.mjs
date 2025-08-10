// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     unoptimized: true,
//     domains: ['res.cloudinary.com'],
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'res.cloudinary.com',
//         pathname: '/**',
//       },
//     ],
//   },
  

  
//   // Disable webpack optimization to fix clientModules error
//   webpack: (config, { dev, isServer }) => {
//     config.resolve.symlinks = false;
    
//     if (!isServer) {
//       config.resolve.fallback = {
//         ...config.resolve.fallback,
//         fs: false,
//         net: false,
//         tls: false,
//       };
//     }
    
//     return config;
//   },
  
//   // Reduce logging in development
//   logging: {
//     fetches: {
//       fullUrl: false,
//     },
//   },
  
//   // Fix experimental features
//   experimental: {
//     serverComponentsExternalPackages: ['mongoose'],
//     optimizePackageImports: ['lucide-react'],
//   },
  
//   // Handle DevTools requests gracefully
//   async rewrites() {
//     return [
//       {
//         source: '/.well-known/appspecific/:path*',
//         destination: '/api/well-known?path=:path*',
//       },
//     ]
//   },
// }

// export default nextConfig


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
  
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  
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
