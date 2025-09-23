"use client"

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import { DynamicAppKitProvider } from '@/components/dynamic/dynamic-appkit'
import { AppProvider } from '@/contexts/app-context'
import { SessionCacheProvider } from '@/contexts/session-cache-context'
import { WebSocketProvider } from '@/contexts/websocket-context'
import { FollowProvider } from '@/contexts/follow-context'
import { NotificationProvider } from '@/contexts/notification-context'
import { Toaster } from '@/components/ui/toaster'
import { authConfig } from '@/lib/auth-config'
import '@/lib/session-interceptor' // Intercept and cache session calls

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      {...authConfig}
      refetchInterval={5 * 60} // Reduce refetch frequency to 5 minutes
      refetchOnWindowFocus={false} // Disable refetch on window focus
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SessionCacheProvider>
          <AppProvider>
            <NotificationProvider>
              <WebSocketProvider>
                <FollowProvider>
                  <DynamicAppKitProvider>
                    {children}
                    <Toaster />
                  </DynamicAppKitProvider>
                </FollowProvider>
              </WebSocketProvider>
            </NotificationProvider>
          </AppProvider>
        </SessionCacheProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}