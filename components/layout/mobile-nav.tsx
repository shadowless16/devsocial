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
  MessageCircle,
  Menu
} from "lucide-react"
import { SimplePostModal } from "@/components/modals/simple-post-modal"
import { MobileMenu } from "@/components/layout/mobile-menu"
import { useNotifications } from "@/contexts/notification-context"

interface MobileNavProps {
  className?: string
}

const getNavItems = (unreadCount: number) => [
  { icon: Home, href: "/home", label: "Home" },
  { icon: Bell, href: "/notifications", label: "Notifications", badge: unreadCount },
  { icon: Plus, href: "#", label: "Create", isAction: true },
  { icon: User, href: "/profile", label: "Profile" },
  { icon: Menu, href: "#", label: "Menu", isMenu: true },
]

interface CreatePostData {
  content: string;
  tags: string[];
  mediaUrls: string[];
  isAnonymous: boolean;
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname()
  const { unreadCount } = useNotifications()
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  const navItems = getNavItems(unreadCount)

  const handleCreateClick = () => {
    setShowCreatePost(true)
  }

  const handleMenuClick = () => {
    setShowMobileMenu(true)
  }

  const handleCreatePost = async (postData: CreatePostData) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
      
      if (response.ok) {
        const json = await response.json();
        const createdPost = json?.data?.post || json?.post || json?.data || {}
        try { window.dispatchEvent(new CustomEvent('post:created', { detail: createdPost })) } catch (e) { console.debug('Failed to dispatch post:created', e) }
        setShowCreatePost(false)
      } else {
        console.error('Failed to create post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  return (
    <>
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 dark:bg-gray-950/95 dark:border-gray-800 md:hidden safe-area-inset-bottom",
        className
      )}>
        <div className="flex items-center justify-center px-4 py-3">
          <div className="flex items-center justify-between w-full max-w-sm bg-white dark:bg-gray-900 rounded-full px-3 py-2 shadow-lg border border-gray-200 dark:border-gray-700">
            {navItems.map((item) => {
              const isActive = (pathname === '/' && item.href === '/home') || pathname === item.href
              const isCreateButton = item.isAction
              const isMenuButton = item.isMenu

              if (isCreateButton) {
                return (
                  <button
                    key={item.label}
                    onClick={handleCreateClick}
                    className="flex items-center justify-center relative min-h-[44px] min-w-[44px]"
                    aria-label={item.label}
                  >
                    <div className="w-11 h-11 bg-emerald-600 rounded-full flex items-center justify-center shadow-md">
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
                    className="flex items-center justify-center relative min-h-[44px] min-w-[44px]"
                    aria-label={item.label}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                  </button>
                )
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-center relative min-h-[44px] min-w-[44px]"
                  aria-label={item.label}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200",
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
                  {item.badge && item.badge > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 rounded-full flex items-center justify-center px-1">
                      <span className="text-[10px] font-bold text-white">{item.badge > 99 ? '99+' : item.badge}</span>
                    </div>
                  )}
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
        <SimplePostModal
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onSubmit={handleCreatePost}
        />
      )}
      
      <MobileMenu 
        isOpen={showMobileMenu} 
        onClose={() => setShowMobileMenu(false)} 
      />
    </>
  )
}