"use client"

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import { DynamicAppKitProvider } from '@/components/dynamic/dynamic-appkit'
import { AuthProvider } from '@/contexts/auth-context'
import { NotificationProvider } from '@/contexts/notification-context'
import { DataModeProvider } from '@/contexts/data-mode-context'
import { FollowProvider } from '@/contexts/follow-context'
import { SessionCacheProvider } from '@/contexts/session-cache-context'
import { WebSocketProvider } from '@/contexts/websocket-context'
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
        <SessionCacheProvider>
          <AuthProvider>
            <DataModeProvider>
              <FollowProvider>
                <NotificationProvider>
                  <WebSocketProvider>
                    <DynamicAppKitProvider>
                      {children}
                      <Toaster />
                    </DynamicAppKitProvider>
                  </WebSocketProvider>
                </NotificationProvider>
              </FollowProvider>
            </DataModeProvider>
          </AuthProvider>
        </SessionCacheProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}