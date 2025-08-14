import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import '@/lib/appkit-config'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevSocial',
  description: 'Gamified dev-collab platform on Hedera',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}