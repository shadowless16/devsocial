"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"

// Remove ssr:false to allow server-side rendering and faster compilation
const SideNav = dynamic(() => import("@/components/layout/side-nav"))
const RightRail = dynamic(() => import("@/components/layout/right-rail"))
const MobileNav = dynamic(() => import("@/components/layout/mobile-nav").then(m => ({ default: m.MobileNav })))
const InstallPrompt = dynamic(() => import("@/components/pwa/install-prompt").then(m => ({ default: m.InstallPrompt })))
const PushNotificationManager = dynamic(() => import("@/components/push-notification-manager"))
const PushNotificationPrompt = dynamic(() => import("@/components/notifications/push-notification-prompt").then(m => ({ default: m.PushNotificationPrompt })))

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')

  if (isAdminPage) {
    return (
      <TooltipProvider>
        <main className="min-h-screen bg-muted/30 pb-16 md:pb-0 w-full overflow-y-auto">
          <div className="w-full">
            {children}
          </div>
          <MobileNav />
          <InstallPrompt />
          <PushNotificationManager />
          <PushNotificationPrompt />
        </main>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <main className="h-screen overflow-hidden bg-muted/30 pb-16 md:pb-0 w-full">
        <div className="mx-auto flex w-full max-w-[1400px] gap-4 md:gap-6 px-2 sm:px-4 md:px-6 lg:px-8 py-2 md:py-4 h-full">
          
          {/* Left Sidebar */}
          <aside className="hidden md:block w-[240px] lg:w-[260px] xl:w-[280px] flex-shrink-0 h-full overflow-y-auto">
            <div className="sticky top-0">
              <SideNav />
            </div>
          </aside>

          {/* Main Feed - Scrollable */}
          <section aria-label="Feed" className="flex-1 max-w-[600px] lg:max-w-[600px] xl:max-w-[650px] mx-auto w-full h-full overflow-y-auto scrollbar-hide">
            {children}
          </section>

          {/* Right Sidebar */}
          <aside className="hidden lg:block w-[300px] xl:w-[320px] flex-shrink-0 h-full overflow-y-auto">
            <div className="sticky top-0">
              <RightRail />
            </div>
          </aside>
        </div>
        <MobileNav />
        <InstallPrompt />
        <PushNotificationManager />
        <PushNotificationPrompt />
      </main>
    </TooltipProvider>
  )
}
