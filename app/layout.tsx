import type { Metadata, Viewport } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import '@/lib/blockchain/appkit-config'
import DisablePrefetch from '@/components/client/disable-prefetch'
import PWAInstall from '@/components/pwa-install'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata: Metadata = {
  title: 'DevSocial',
  description: 'Gamified dev-collab platform on Hedera',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DevSocial',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#7c3aed', // Updated to new primary
}

// Prefetch disabling runs on the client via a small client component

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script src="/register-sw.js" defer />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased text-foreground bg-background`}>
        <Providers>
          {process.env.NODE_ENV === 'development' ? (
            <DisablePrefetch />
          ) : null}
          {children}
          <PWAInstall />
        </Providers>
      </body>
    </html>
  )
}