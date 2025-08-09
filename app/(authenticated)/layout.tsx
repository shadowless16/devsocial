"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Menu, X, Loader2, ChevronLeft, ChevronRight, PanelLeftClose, PanelRightClose } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavSidebar } from "@/components/layout/nav-sidebar"
import { RightSidebar } from "@/components/layout/right-sidebar"
import { XPBar } from "@/components/gamification/xp-bar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"

export const dynamic = 'force-dynamic'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  const handleLeftSidebarToggle = () => {
    setIsTransitioning(true)
    setLeftSidebarCollapsed(!leftSidebarCollapsed)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const handleRightSidebarToggle = () => {
    setIsTransitioning(true)
    setRightSidebarCollapsed(!rightSidebarCollapsed)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
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
      <div className="lg:hidden bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-3 py-2 flex items-center justify-between sticky top-0 z-40 shadow-sm backdrop-blur-sm bg-white/95 dark:bg-gray-950/95">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLeftSidebarOpen(true)} 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="font-bold text-base sm:text-lg text-navy-900 dark:text-white truncate mx-2">TechConnect</h1>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setRightSidebarOpen(true)} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex relative">
        {/* Left Sidebar - Desktop */}
        <div className={cn(
          "hidden lg:flex fixed left-0 top-0 h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 z-30 transition-all duration-300 ease-in-out shadow-lg",
          leftSidebarCollapsed ? "w-12" : "w-48",
          isTransitioning && "overflow-hidden"
        )}>
          {/* Collapse Toggle Button */}
          <div className="absolute top-4 -right-3 z-40">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLeftSidebarToggle}
              className={cn(
                "w-6 h-6 p-0 rounded-full bg-white dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 shadow-md",
                "hover:scale-110 active:scale-95"
              )}
            >
              {leftSidebarCollapsed ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronLeft className="w-3 h-3" />
              )}
            </Button>
          </div>
          <NavSidebar collapsed={leftSidebarCollapsed} />
        </div>

        {/* Left Sidebar - Mobile Overlay */}
        {leftSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
              onClick={() => setLeftSidebarOpen(false)} 
            />
            <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-950 shadow-2xl transform transition-transform duration-300 ease-out">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h2 className="font-semibold text-gray-900 dark:text-white">Navigation</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setLeftSidebarOpen(false)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <NavSidebar onItemClick={() => setLeftSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={cn(
          "flex-1 w-full max-w-full overflow-x-hidden transition-all duration-300 ease-in-out",
          leftSidebarCollapsed ? "lg:ml-12" : "lg:ml-48",
          rightSidebarCollapsed ? "lg:mr-12" : "lg:mr-56"
        )}>
          <main className="min-h-screen w-full">{children}</main>
        </div>

        {/* Right Sidebar - Desktop */}
        <div className={cn(
          "hidden lg:flex fixed right-0 top-0 h-full bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 z-30 transition-all duration-300 ease-in-out shadow-lg",
          rightSidebarCollapsed ? "w-12" : "w-56",
          isTransitioning && "overflow-hidden"
        )}>
          {/* Collapse Toggle Button */}
          <div className="absolute top-4 -left-3 z-40">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRightSidebarToggle}
              className={cn(
                "w-6 h-6 p-0 rounded-full bg-white dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 shadow-md",
                "hover:scale-110 active:scale-95"
              )}
            >
              {rightSidebarCollapsed ? (
                <ChevronLeft className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          </div>
          <RightSidebar collapsed={rightSidebarCollapsed} />
        </div>

        {/* Right Sidebar - Mobile Overlay */}
        {rightSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
              onClick={() => setRightSidebarOpen(false)} 
            />
            <div className="absolute right-0 top-0 h-full w-72 bg-white dark:bg-gray-950 shadow-2xl transform transition-transform duration-300 ease-out">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h2 className="font-semibold text-gray-900 dark:text-white">Trending & Activity</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setRightSidebarOpen(false)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
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
