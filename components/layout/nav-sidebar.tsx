"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  Bell,
  Compass,
  Grid2X2,
  Home,
  ListOrdered,
  Moon,
  Plus,
  Search,
  Trophy,
  User,
  LogOut,
  Settings2,
  MessageCircle,
  Shield,
  FolderOpen,
  Briefcase
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { PostModal } from "@/components/modals/post-modal"
import { NotificationCenter } from "@/components/notifications/notification-center"

interface NavSidebarProps {
  collapsed?: boolean
  onItemClick?: () => void
}

type NavItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: string
  adminOnly?: boolean
}

const navigationItems: NavItem[] = [
  { label: "Home", icon: Home, href: "/home" },
  { label: "Dashboard", icon: Grid2X2, href: "/dashboard" },
  { label: "Projects", icon: FolderOpen, href: "/projects" },
  { label: "My Projects", icon: Briefcase, href: "/projects/my" },
  { label: "Search", icon: Search, href: "/search" },
  { label: "Trending", icon: Compass, href: "/trending" },
  { label: "Challenges", icon: ListOrdered, href: "/challenges", badge: "3" },
  { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
  { label: "Dev Profile", icon: User, href: "/profile" },
  { label: "Connect", icon: MessageCircle, href: "/messages" },
  { label: "Moderation", icon: Shield, href: "/moderation", adminOnly: true },
]

export function NavSidebar({ collapsed = false, onItemClick }: NavSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const displayUser = user || {
    username: "",
    displayName: "",
    avatar: "",
    level: 1,
    points: 0,
    totalXpForLevel: 1000,
    xpToNext: 239,
    role: "user"
  }

  if (collapsed) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-950 p-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-600 text-white shadow-sm mx-auto mb-4">
          {"</>"}  
        </div>
        {displayUser.username && (
          <Avatar className="h-10 w-10 ring-1 ring-emerald-100 mx-auto mb-4">
            <AvatarImage src={displayUser.avatar || "/placeholder.svg"} alt={displayUser.displayName || displayUser.username} />
            <AvatarFallback>{((displayUser.displayName || displayUser.username || "G")).charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-gray-950 p-3 overflow-y-auto overflow-x-hidden">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-600 text-white shadow-sm">{"</>"}  </div>
          <div className="grid">
            <span className="text-lg font-semibold leading-none">TechConnect</span>
            <span className="text-xs text-muted-foreground">Connect • Learn • Build</span>
          </div>
        </div>

        {displayUser.username && (
          <Card className="border-0 p-3 ring-1 ring-black/5 w-full">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 ring-1 ring-emerald-100 flex-shrink-0">
                <AvatarImage src={displayUser.avatar || "/placeholder.svg"} alt={displayUser.displayName || displayUser.username} />
                <AvatarFallback>{((displayUser.displayName || displayUser.username || "G")).charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium break-words">{displayUser.displayName || displayUser.username}</div>
                <div className="text-xs text-muted-foreground">{(displayUser.points ?? 0).toLocaleString()} XP</div>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 text-xs">{`Level ${displayUser.level}`}</Badge>
              </div>
              <Progress value={displayUser.totalXpForLevel > 0 ? (displayUser.points / displayUser.totalXpForLevel) * 100 : 0} className="[&>div]:bg-emerald-600 h-1" />
              <div className="mt-1 text-[10px] text-muted-foreground">{`${displayUser.xpToNext} XP to next`}</div>
            </div>
          </Card>
        )}

        <nav className="grid gap-1">
          {navigationItems.map((item) => {
            if (item.adminOnly && displayUser.role !== "admin") return null;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "group relative flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-all",
                  isActive
                    ? "bg-emerald-600/10 text-emerald-700 ring-1 ring-emerald-600/20"
                    : "hover:bg-muted",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-emerald-700" : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span className="flex-1 break-words text-xs">{item.label}</span>
                {item.badge ? (
                  <Badge className="ml-auto h-6 rounded-full bg-orange-100 px-2 text-[11px] font-medium text-orange-700 hover:bg-orange-100">
                    {item.badge}
                  </Badge>
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="grid gap-2">
          <div className="text-xs font-medium text-muted-foreground">Quick Actions</div>
          <div className="flex items-center gap-1">
            <Button 
              className="flex-1 bg-emerald-600 hover:bg-emerald-600/90 text-xs px-2 py-1"
              onClick={() => setShowCreatePost(true)}
            >
              <Plus className="mr-1 h-3 w-3" />
              Create
            </Button>
            <Button 
              variant="secondary" 
              className="flex-1 gap-1 text-xs px-2 py-1"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="h-3 w-3" />
              <span>3</span>
            </Button>
          </div>
        </div>

        <Separator />

        <div className="grid gap-1">
          <Link href="/settings" onClick={onItemClick}>
            <Button variant="ghost" className="justify-start gap-2 w-full text-xs px-2 py-1">
              <Settings2 className="h-3 w-3" />
              Settings
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="justify-start gap-2 text-xs px-2 py-1"
            onClick={() => {
              const html = document.documentElement;
              if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                localStorage.setItem('theme', 'light');
              } else {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
              }
            }}
          >
            <Moon className="h-3 w-3" />
            Dark Mode
          </Button>
          <Button 
            variant="ghost" 
            className="justify-start gap-2 text-red-600 hover:text-red-600 text-xs px-2 py-1"
            onClick={() => {
              logout();
              if (onItemClick) onItemClick();
            }}
          >
            <LogOut className="h-3 w-3" />
            Logout
          </Button>
        </div>
      </div>

      {showCreatePost && (
        <PostModal
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onSubmit={async (postData) => {
            setShowCreatePost(false);
          }}
        />
      )}
      
      {showNotifications && (
        <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
}