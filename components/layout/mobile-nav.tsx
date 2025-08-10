"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Home, 
  Search, 
  Plus, 
  Bell, 
  User,
  Trophy,
  Grid2X2,
  Compass,
  MessageCircle,
  Menu
} from "lucide-react"
import { PostModal } from "@/components/modals/post-modal"
import { MobileMenu } from "@/components/layout/mobile-menu"

interface MobileNavProps {
  className?: string
}

const navItems = [
  { icon: Home, href: "/home", label: "Home" },
  { icon: Compass, href: "/trending", label: "Trending" },
  { icon: Plus, href: "#", label: "Create", isAction: true },
  { icon: Trophy, href: "/leaderboard", label: "Leaderboard" },
  { icon: Menu, href: "#", label: "Menu", isMenu: true },
]

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname()
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleCreateClick = () => {
    setShowCreatePost(true)
  }

  const handleMenuClick = () => {
    setShowMobileMenu(true)
  }

  return (
    <>
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 dark:bg-gray-950/95 dark:border-gray-800 md:hidden",
        className
      )}>
        <div className="flex items-center justify-center px-6 py-3">
          <div className="flex items-center justify-between w-full max-w-xs bg-white dark:bg-gray-900 rounded-full px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const isCreateButton = item.isAction
              const isMenuButton = item.isMenu

              if (isCreateButton) {
                return (
                  <button
                    key={item.label}
                    onClick={handleCreateClick}
                    className="flex items-center justify-center relative"
                    aria-label={item.label}
                  >
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shadow-md">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                  </button>
                )
              }

              if (isMenuButton) {
                return (
                  <button
                    key={item.label}
                    onClick={handleMenuClick}
                    className="flex items-center justify-center relative"
                    aria-label={item.label}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                  </button>
                )
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-center relative"
                  aria-label={item.label}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                    isActive 
                      ? "bg-emerald-100 dark:bg-emerald-900/30" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}>
                    <item.icon className={cn(
                      "w-4 h-4 transition-colors",
                      isActive 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-gray-500 dark:text-gray-400"
                    )} />
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-2 w-1 h-1 bg-emerald-600 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {showCreatePost && (
        <PostModal
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onSubmit={async (postData) => {
            setShowCreatePost(false)
          }}
        />
      )}
      
      <MobileMenu 
        isOpen={showMobileMenu} 
        onClose={() => setShowMobileMenu(false)} 
      />
    </>
  )
}