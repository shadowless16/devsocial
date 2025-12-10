import type { Metadata, Viewport } from 'next'
// import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import '@/lib/blockchain/appkit-config'
import DisablePrefetch from '@/components/client/disable-prefetch'
import PWAInstall from '@/components/pwa-install'

// const inter = Inter({ subsets: ['latin'] })

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
  themeColor: '#3b82f6',
}

// Prefetch disabling runs on the client via a small client component

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script src="/register-sw.js" defer />
      </head>
      <body className=''>
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