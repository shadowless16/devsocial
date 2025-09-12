// Lazily load bundle-analyzer only when not running with Turbopack
// to avoid registering webpack plugins that trigger the Turbopack warning.
const isTurbopack = !!(
  process.env.__NEXT_PRIVATE_TURBOPACK === '1' ||
  process.env.NEXT_TURBOPACK === '1' ||
  process.env.__NEXT_PRIVATE_TURBOPACK
)

let withBundleAnalyzer = (cfg) => cfg

// Use an async export below to dynamically import the analyzer only when needed.

/** @type {import('next').NextConfig} */
const nextConfig = {
  
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
  
  // Webpack customizations are attached only when Turbopack is not active.
  // This prevents Next from warning when running `next dev --turbo`.
  
  serverExternalPackages: ['mongoose'],
  
  async rewrites() {
    return [
      {
        source: '/.well-known/appspecific/:path*',
        destination: '/api/well-known?path=:path*',
      },
    ]
  },
}

export default (async () => {
  if (!isTurbopack) {
    try {
      const mod = await import('@next/bundle-analyzer')
      const bundleAnalyzer = mod.default || mod
      withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })
    } catch (err) {
      // If import fails, fall back to identity.
      // Keep going — analyzer is an optional dev tool.
      // eslint-disable-next-line no-console
      console.warn('Could not load @next/bundle-analyzer:', err?.message || err)
    }

    // Attach webpack customizations only when running webpack (not Turbopack)
    nextConfig.webpack = (config, { isServer }) => {
      if (!isServer) {
        config.resolve = config.resolve || {}
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
        }
      }
      return config
    }
  }

  return withBundleAnalyzer(nextConfig)
})()
