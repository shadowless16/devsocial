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
      <main className="min-h-[100svh] bg-muted/30 pb-16 md:pb-6 w-full overflow-x-hidden">
        <div className="mx-auto grid w-full max-w-[1400px] gap-4 md:gap-6 px-4 sm:px-6 md:px-8 lg:px-12 py-3 md:py-6 
          md:grid-cols-[240px_1fr] lg:grid-cols-[260px_minmax(0,600px)_300px] xl:grid-cols-[280px_minmax(0,650px)_320px] overflow-x-hidden">
          
          {/* Left Sidebar */}
          <aside className="hidden md:block sticky top-6 self-start overflow-y-auto max-h-[calc(100vh-3rem)]">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <SideNav />
            </Suspense>
          </aside>

          {/* Main Feed */}
          <section aria-label="Feed" className="grid gap-3 md:gap-6 w-full min-w-0 px-0 overflow-visible mx-auto">
            {children}
          </section>

          {/* Right Sidebar */}
          <aside className="hidden lg:block sticky top-6 self-start overflow-y-auto max-h-[calc(100vh-3rem)]">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <RightRail />
            </Suspense>
          </aside>
        </div>
        <MobileNav />
      </main>
    </TooltipProvider>
  )
}
