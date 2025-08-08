"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Menu, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavSidebar } from "@/components/layout/nav-sidebar"
import { RightSidebar } from "@/components/layout/right-sidebar"
import { XPBar } from "@/components/gamification/xp-bar"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-3 py-2 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <Button variant="ghost" size="sm" onClick={() => setLeftSidebarOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="font-bold text-base sm:text-lg text-navy-900 dark:text-white truncate mx-2">TechConnect</h1>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={() => setRightSidebarOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Desktop */}
        <div className="hidden lg:block fixed left-0 top-0 h-full w-56 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 z-10">
          <NavSidebar />
        </div>

        {/* Left Sidebar - Mobile Overlay */}
        {leftSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setLeftSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-56 bg-white dark:bg-gray-950">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h2 className="font-semibold text-gray-900 dark:text-white">Menu</h2>
                <Button variant="ghost" size="sm" onClick={() => setLeftSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <NavSidebar onItemClick={() => setLeftSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-56 lg:mr-72 w-full max-w-full overflow-x-hidden">
          <main className="min-h-screen w-full">{children}</main>
        </div>

        {/* Right Sidebar - Desktop */}
        <div className="hidden lg:block fixed right-0 top-0 h-full w-72 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 z-10">
          <RightSidebar />
        </div>

        {/* Right Sidebar - Mobile Overlay */}
        {rightSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setRightSidebarOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-72 bg-white dark:bg-gray-950">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h2 className="font-semibold text-gray-900 dark:text-white">Trending</h2>
                <Button variant="ghost" size="sm" onClick={() => setRightSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <RightSidebar />
            </div>
          </div>
        )}
      </div>

      {/* Sticky XP Bar */}
      <XPBar />
    </div>
  )
}
