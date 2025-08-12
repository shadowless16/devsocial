import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { FollowProvider } from "@/contexts/follow-context"
import { WebSocketProvider } from "@/contexts/websocket-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { DataModeProvider } from "@/contexts/data-mode-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"

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
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${inter.className} overflow-x-hidden w-full max-w-full`}>
        <ThemeProvider>
          <DataModeProvider>
            <AuthProvider>
              <WebSocketProvider>
                <NotificationProvider>
                  <FollowProvider>
                    {children}
                  </FollowProvider>
                </NotificationProvider>
              </WebSocketProvider>
            </AuthProvider>
          </DataModeProvider>
        </ThemeProvider>
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </body>
    </html>
  )
}