"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import SideNav from "@/components/side-nav"
import RightRail from "@/components/right-rail"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <main className="min-h-[100svh] bg-muted/30">
        <div className="mx-auto grid w-full max-w-[120rem] grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[156px_1fr] lg:grid-cols-[168px_1fr_216px]">
          <aside className="hidden md:block">
            <SideNav />
          </aside>

          <section aria-label="Main Content" className="grid gap-6">
            {children}
          </section>

          <aside className="hidden lg:block">
            <RightRail />
          </aside>
        </div>
      </main>
    </TooltipProvider>
  )
}

