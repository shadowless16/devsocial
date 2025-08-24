import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import '@/lib/appkit-config'

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevSocial',
  description: 'Gamified dev-collab platform on Hedera',
}

// Disable prefetching in development
if (process.env.NODE_ENV === 'development') {
  const originalPrefetch = require('next/link').default.prefetch
  require('next/link').default.prefetch = () => {}
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className=''>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}