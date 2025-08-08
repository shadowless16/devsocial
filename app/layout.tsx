import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { LoggerInitializer } from "@/components/logger-initializer"
// import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
// import { extractRouterConfig } from "uploadthing/server"
// import { ourFileRouter } from "@/app/api/uploadthing/core"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DevSocial - Connect, Learn, Code",
  description:
    "A gamified social media platform for student developers with real-time messaging and comprehensive analytics",
  generator: 'Ak David',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LoggerInitializer />
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
