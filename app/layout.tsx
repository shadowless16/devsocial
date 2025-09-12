import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import '@/lib/appkit-config'
import DisablePrefetch from '@/components/client/disable-prefetch'

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevSocial',
  description: 'Gamified dev-collab platform on Hedera',
}

// Prefetch disabling runs on the client via a small client component

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className=''>
        <Providers>
          {/* Client-only: disable next/link prefetch in development */}
          {process.env.NODE_ENV === 'development' ? (
            <DisablePrefetch />
          ) : null}
          {children}
        </Providers>
      </body>
    </html>
  )
}