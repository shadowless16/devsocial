"use client"

import { useEffect, Suspense } from "react"
import { useRouter, usePathname } from "next/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"
import SideNav from "@/components/layout/side-nav"
import RightRail from "@/components/layout/right-rail"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    if (pathname === '/') {
      router.replace('/home')
    }
  }, [pathname, router])
  
  return (
    <TooltipProvider>
      <main className="min-h-[100svh] bg-muted/30 pb-16 md:pb-6 w-full">
        <div className="mx-auto flex w-full max-w-[1400px] gap-4 md:gap-6 px-2 sm:px-4 md:px-6 lg:px-8 py-2 md:py-4">
          
          {/* Left Sidebar */}
          <aside className="hidden md:block w-[240px] lg:w-[260px] xl:w-[280px] flex-shrink-0">
            <div className="sticky top-6 overflow-y-auto max-h-[calc(100vh-3rem)]">
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <SideNav />
              </Suspense>
            </div>
          </aside>

          {/* Main Feed */}
          <section aria-label="Feed" className="flex-1 max-w-[600px] lg:max-w-[600px] xl:max-w-[650px] mx-auto w-full">
            {children}
          </section>

          {/* Right Sidebar */}
          <aside className="hidden lg:block w-[300px] xl:w-[320px] flex-shrink-0">
            <div className="sticky top-6 overflow-y-auto max-h-[calc(100vh-3rem)]">
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <RightRail />
              </Suspense>
            </div>
          </aside>
        </div>
        <MobileNav />
      </main>
    </TooltipProvider>
  )
}
