"use client"

import { ThemeProvider } from '@/components/theme-provider'
import { AppKitProvider } from '@/components/providers/appkit-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { NotificationProvider } from '@/contexts/notification-context'
import { DataModeProvider } from '@/contexts/data-mode-context'
import { FollowProvider } from '@/contexts/follow-context'
import { SessionCacheProvider } from '@/contexts/session-cache-context'
import { WebSocketProvider } from '@/contexts/websocket-context'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
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
                  <AppKitProvider>
                    {children}
                    <Toaster />
                  </AppKitProvider>
                </WebSocketProvider>
              </NotificationProvider>
            </FollowProvider>
          </DataModeProvider>
        </AuthProvider>
      </SessionCacheProvider>
    </ThemeProvider>
  )
}