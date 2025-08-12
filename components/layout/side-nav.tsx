"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Bell,
  Compass,
  FolderOpen,
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
  BarChart3,
} from "lucide-react"
import { PostModal } from "@/components/modals/post-modal"
import { useNotifications } from "@/contexts/notification-context"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

type NavItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  badge?: string
}

const getNavItems = (userRole?: string): NavItem[] => {
  const baseNav: NavItem[] = [
    { label: "Home", icon: Home, href: "/home" },
    { label: "Dashboard", icon: Grid2X2, href: "/dashboard" },
    { label: "Search", icon: Search, href: "/search" },
    { label: "Trending", icon: Compass, href: "/trending" },
    { label: "Projects", icon: FolderOpen, href: "/projects" },
    { label: "Missions", icon: ListOrdered, href: "/missions", badge: "3" },
    { label: "referrals", icon: Plus, href: "/referrals" },
    { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
    { label: "My Profile", icon: User, href: "/profile" },
  ]

  // Add analytics for admin and moderator users
  if (userRole === 'admin' || userRole === 'moderator') {
    baseNav.splice(-1, 0, { label: "Analytics", icon: BarChart3, href: "/analytics" })
  }

  return baseNav
}

export default function SideNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [active, setActive] = useState("")
  
  useEffect(() => {
    // Update active state based on current pathname
    const currentPath = pathname === '/' || pathname === '/home' ? '/home' : pathname
    const navItems = getNavItems(user?.role)
    const activeItem = navItems.find(item => {
      if (item.href === '/' && (currentPath === '/home' || currentPath === '/')) return true
      return item.href === currentPath
    })
    if (activeItem) {
      setActive(activeItem.label)
    }
  }, [pathname, user?.role])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const calculateProgress = (currentXP: number, level: number) => {
    const currentLevelXP = (level - 1) * 1000
    const nextLevelXP = level * 1000
    const progress = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    return Math.max(0, Math.min(100, progress))
  }

  const getXPToNext = (currentXP: number, level: number) => {
    const nextLevelXP = level * 1000
    return Math.max(0, nextLevelXP - currentXP)
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-1">
        <div className="grid h-6 w-6 place-items-center rounded-md bg-emerald-600 text-white shadow-sm text-xs">{"</>"}</div>
        <div className="grid">
          <span className="text-sm font-semibold leading-none">TechConnect</span>
          <span className="text-[10px] text-muted-foreground">Connect • Learn</span>
        </div>
      </div>

      <Card className="border-0 p-2 ring-1 ring-black/5">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 ring-1 ring-emerald-100">
            <AvatarImage 
              src={user?.avatar?.includes('models.readyplayer.me') && user.avatar.endsWith('.glb') 
                ? user.avatar.replace('.glb', '.png') 
                : user?.avatar || "/placeholder.svg"} 
              alt={user?.displayName || user?.username}
            />
            <AvatarFallback className="text-xs">{getInitials(user?.displayName || user?.username || 'User')}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <div className="truncate text-xs font-medium">{user?.displayName || user?.username || 'User'}</div>
              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 text-[10px] px-1">L{user?.level || 1}</Badge>
            </div>
            <div className="text-[10px] text-muted-foreground">{user?.points || 0} XP</div>
          </div>
        </div>
        <div className="mt-2">
          <Progress value={calculateProgress(user?.points || 0, user?.level || 1)} className="[&>div]:bg-emerald-600 h-1" />
          <div className="mt-1 text-[9px] text-muted-foreground">{getXPToNext(user?.points || 0, user?.level || 1)} XP to next</div>
        </div>
      </Card>

      <ScrollArea className="h-[48vh] rounded-md">
        <nav className="grid gap-0.5 pr-1">
          {getNavItems(user?.role).map((item) => (
            <Link
              key={item.label}
              href={item.href ?? "#"}
              className={cn(
                "group relative flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-all",
                active === item.label
                  ? "bg-emerald-600/10 text-emerald-700 ring-1 ring-emerald-600/20"
                  : "hover:bg-muted",
              )}
              aria-current={active === item.label ? "page" : undefined}
              onClick={() => setActive(item.label)}
            >
              <item.icon
                className={cn(
                  "h-3 w-3 transition-colors",
                  active === item.label ? "text-emerald-700" : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <Badge className="ml-auto h-4 rounded-full bg-orange-100 px-1 text-[9px] font-medium text-orange-700 hover:bg-orange-100">
                  {item.badge}
                </Badge>
              ) : null}
            </Link>
          ))}
        </nav>
      </ScrollArea>

      <div className="grid gap-1">
        <div className="text-[10px] font-medium text-muted-foreground">Quick Actions</div>
        <div className="flex items-center gap-1">
          <CreateButton />
          <NotificationButton />
        </div>
      </div>

      <Separator />

      <div className="grid gap-0.5">
        <Button 
          variant="ghost" 
          className="justify-start gap-1 text-xs h-7"
          onClick={() => window.location.href = '/settings'}
        >
          <Settings2 className="h-3 w-3" />
          Settings
        </Button>
        <Button 
          variant="ghost" 
          className="justify-start gap-1 text-xs h-7"
          onClick={() => document.documentElement.classList.toggle('dark')}
        >
          <Moon className="h-3 w-3" />
          Dark Mode
        </Button>
        <Button 
          variant="ghost" 
          className="justify-start gap-1 text-red-600 hover:text-red-600 text-xs h-7"
          onClick={() => {
            localStorage.clear()
            window.location.href = '/auth/login'
          }}
        >
          <LogOut className="h-3 w-3" />
          Logout
        </Button>
      </div>
    </div>
  )
}

function CreateButton() {
  const [showPostModal, setShowPostModal] = useState(false)
  const { toast } = useToast()

  const handleCreatePost = async (postData: any) => {
    try {
      const response = await apiClient.createPost(postData)
      if (response.success) {
        toast({ title: "Success", description: "Post created successfully!" })
        setShowPostModal(false)
        window.location.reload()
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create post", variant: "destructive" })
    }
  }

  return (
    <>
      <Button 
        className="flex-1 bg-emerald-600 hover:bg-emerald-600/90 text-xs h-7"
        onClick={() => setShowPostModal(true)}
      >
        <Plus className="mr-1 h-3 w-3" />
        Create
      </Button>
      
      <PostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={handleCreatePost}
      />
    </>
  )
}

function NotificationButton() {
  const { unreadCount } = useNotifications()
  const router = useRouter()

  return (
    <Button 
      variant="secondary" 
      className="flex-1 gap-1 text-xs h-7"
      onClick={() => router.push('/notifications')}
    >
      <Bell className="h-3 w-3" />
      <span>{unreadCount > 0 ? unreadCount : '0'}</span>
    </Button>
  )
}