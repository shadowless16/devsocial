"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"
import SideNav from "@/components/side-nav"
import RightRail from "@/components/right-rail"
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
      <main className="min-h-[100svh] bg-muted/30 pb-16 md:pb-6">
        <div className="mx-auto grid w-full max-w-[120rem] grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[156px_1fr] lg:grid-cols-[168px_1fr_216px]">
          <aside className="hidden md:block">
            <SideNav />
          </aside>

          <section aria-label="Feed" className="grid gap-6">
            {children}
          </section>

          <aside className="hidden lg:block">
            <RightRail />
          </aside>
        </div>
        <MobileNav />
      </main>
    </TooltipProvider>
  )
}

