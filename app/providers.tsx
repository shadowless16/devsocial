"use client"

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import { DynamicAppKitProvider } from '@/components/dynamic/dynamic-appkit'
import { AppProvider } from '@/contexts/app-context'
import { WebSocketProvider } from '@/contexts/websocket-context'
import { FollowProvider } from '@/contexts/follow-context'
import { Toaster } from '@/components/ui/toaster'
import { authConfig } from '@/lib/auth-config'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider {...authConfig}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AppProvider>
          <WebSocketProvider>
            <FollowProvider>
              <DynamicAppKitProvider>
                {children}
                <Toaster />
              </DynamicAppKitProvider>
            </FollowProvider>
          </WebSocketProvider>
        </AppProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}