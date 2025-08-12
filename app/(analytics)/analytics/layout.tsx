import type React from "react"
import { Suspense } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import AnalyticsSidebar from "@/components/analytics/analytics-sidebar"

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <main className="min-h-[100svh] bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto grid w-full max-w-[120rem] grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr]">
          {/* Analytics Sidebar */}
          <aside className="hidden md:block">
            <Suspense fallback={<div>Loading...</div>}>
              <AnalyticsSidebar />
            </Suspense>
          </aside>

          {/* Main Analytics Content */}
          <section className="grid gap-6">
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </section>
        </div>
      </main>
    </TooltipProvider>
  )
}
