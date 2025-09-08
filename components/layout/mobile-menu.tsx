"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { 
  Grid2X2,
  FolderOpen,
  ListOrdered,
  Settings,
  LogOut,
  Moon,
  Compass,
  Search,
  MessageCircle,
  Shield,
  X,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"


interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { icon: Grid2X2, href: "/dashboard", label: "Dashboard" },
  { icon: Compass, href: "/trending", label: "Trending" },
  { icon: Search, href: "/search", label: "Search" },
  { icon: ListOrdered, href: "/leaderboard", label: "Leaderboard" },    
  { icon: FolderOpen, href: "/projects", label: "Projects" },
  { icon: ListOrdered, href: "/missions", label: "Missions", badge: "3" },
  { icon: MessageCircle, href: "/messages", label: "Messages" },
  { icon: Shield, href: "/moderation", label: "Moderation", adminOnly: true },
  { icon: Settings, href: "/settings", label: "Settings" },
]

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [localUser, setLocalUser] = useState(user)

  const handleThemeToggle = () => {
    const html = document.documentElement
    if (html.classList.contains('dark')) {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  useEffect(() => {
    setLocalUser(user)
  }, [user])

  useEffect(() => {
    const handleUserUpdated = (e: any) => {
      if (e?.detail) setLocalUser(e.detail)
    }
    window.addEventListener('user:updated', handleUserUpdated as EventListener)
    return () => window.removeEventListener('user:updated', handleUserUpdated as EventListener)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-950 shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-white shadow-sm text-sm">
                {"</>"}
              </div>
              <span className="font-semibold">DevSocial</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Profile */}
          {localUser && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-emerald-100">
                  <AvatarImage src={localUser.avatar || "/generic-user-avatar.png"} alt={localUser.displayName || localUser.username} />
                  <AvatarFallback>{(localUser.displayName || localUser.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{localUser.displayName || localUser.username}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-emerald-50 text-emerald-700 text-xs">L{localUser.level || 1}</Badge>
                    <span className="text-xs text-muted-foreground">{(localUser.points || 0).toLocaleString()} XP</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-2">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                if (item.adminOnly && user?.role !== "admin") return null
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn(
                        "h-5 w-5",
                        isActive ? "text-emerald-700 dark:text-emerald-400" : "text-gray-500"
                      )} />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <Badge className="bg-orange-100 text-orange-700 text-xs px-1.5">
                          {item.badge}
                        </Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-2 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10"
              onClick={handleThemeToggle}
            >
              <Moon className="h-5 w-5" />
              <span>Dark Mode</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10 text-red-600 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}