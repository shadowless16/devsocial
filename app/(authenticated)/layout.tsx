"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"
import SideNav from "@/components/layout/side-nav"
import RightRail from "@/components/layout/right-rail"
import { MobileNav } from "@/components/layout/mobile-nav"

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
        <div className="mx-auto grid w-full max-w-[120rem] grid-cols-1 gap-3 md:gap-6 px-3 sm:px-4 py-3 md:py-6 md:grid-cols-[156px_1fr] lg:grid-cols-[168px_1fr_216px]">
          <aside className="hidden md:block w-full">
            <SideNav />
          </aside>

          <section aria-label="Feed" className="grid gap-3 md:gap-6 w-full min-w-0 px-0">
            {children}
          </section>

          <aside className="hidden lg:block w-full">
            <RightRail />
          </aside>
        </div>
        <MobileNav />
      </main>
    </TooltipProvider>
  )
}

