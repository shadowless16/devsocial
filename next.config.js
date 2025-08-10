// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // Reduce compilation logs
//   logging: {
//     fetches: {
//       fullUrl: false,
//     },
//   },
  
//   // Optimize for development
//   experimental: {
//     optimizePackageImports: ['lucide-react'],
//   },

//   // Reduce webpack logs
//   webpack: (config, { dev }) => {
//     if (dev) {
//       config.infrastructureLogging = {
//         level: 'error',
//       };
//     }
//     return config;
//   },
// };

// module.exports = nextConfig;

// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // keep this for best React practices
  typescript: {
    ignoreBuildErrors: true, // THIS disables build fail on TS errors
  },
  eslint: {
    ignoreDuringBuilds: true, // also disables ESLint build fail, optional but useful
  },
}

module.exports = nextConfig;
