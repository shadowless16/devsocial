"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth, useApp } from "@/contexts/app-context"
import { useUIState } from "@/hooks/use-ui-state"
import { UserAvatar } from "@/components/ui/user-avatar"
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
  Shield,
  MessageSquare,
  BookOpen,
  Database,
  UserCog,
} from "lucide-react"
import { SimplePostModal } from "@/components/modals/simple-post-modal"
import { InstallButton } from "@/components/pwa/install-button"

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
    { label: "Knowledge Bank", icon: Database, href: "/knowledge-bank" },
    { label: "Career Paths", icon: BookOpen, href: "/career-paths" },
    { label: "Communities", icon: MessageSquare, href: "/communities" },
    { label: "Search", icon: Search, href: "/search" },
    { label: "Trending", icon: Compass, href: "/trending" },
    { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
    { label: "My Profile", icon: User, href: "/profile" },
  ]

  // Add admin/moderator specific items
  if (userRole === 'admin' || userRole === 'moderator') {
    baseNav.splice(-1, 0, { label: "Analytics", icon: BarChart3, href: "/analytics" })
    baseNav.splice(-1, 0, { label: "Moderation", icon: Shield, href: "/moderation" })
    baseNav.splice(-1, 0, { label: "Admin Roles", icon: UserCog, href: "/admin-roles" })
  }
  
  if (userRole === 'admin') {
    baseNav.splice(-1, 0, { label: "User Management", icon: UserCog, href: "/admin/users" })
  }

  return baseNav
}

export default function SideNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { handleThemeToggle } = useUIState()
  const [active, setActive] = useState("")
  const [points, setPoints] = useState<number>(user?.points || 0)
  const [level, setLevel] = useState<number>(user?.level || 1)
  
  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark')
    }
  }, [])
  
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

  useEffect(() => {
    // Use user data from auth context instead of making additional API calls
    if (user) {
      setPoints(user.points || 0);
      setLevel(user.level || 1);
    }

    // Listen for user updates from AuthProvider
    const handleUserUpdated = (e: any) => {
      try {
        const updatedUser = e?.detail;
        if (!updatedUser) return;
        setPoints(updatedUser.points ?? 0);
        setLevel(updatedUser.level ?? 1);
      } catch (err) {
        console.debug('Error handling user:updated in SideNav', err);
      }
    };
    window.addEventListener('user:updated', handleUserUpdated as EventListener);

    return () => {
      window.removeEventListener('user:updated', handleUserUpdated as EventListener);
    };
  }, [user]);

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
        <div className="grid h-6 w-6 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm text-xs">{"</>"}</div>
        <div className="grid">
          <span className="text-sm font-semibold leading-none">DevSocial</span>
          <span className="text-[10px] text-muted-foreground">Connect • Learn</span>
        </div>
      </div>

      <Card className="border-0 p-2 ring-1 ring-black/5">
        <div className="flex items-center gap-2">
          {user && (
            <UserAvatar 
              user={{
                username: user.username || '',
                avatar: user.avatar,
                displayName: user.displayName || user.username
              }}
              className="h-6 w-6 ring-1 ring-primary/20"
            />
          )}
          <div className="min-w-0">
              <div className="flex items-center gap-1">
              <div className="truncate text-xs font-medium">{user?.displayName || user?.username || 'User'}</div>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-[10px] px-1">L{level || 1}</Badge>
            </div>
            <div className="text-[10px] text-muted-foreground">{points || 0} XP</div>
          </div>
        </div>
        <div className="mt-2">
          <Progress value={calculateProgress(points || 0, level || 1)} className="[&>div]:bg-primary h-1" />
          <div className="mt-1 text-[9px] text-muted-foreground">{getXPToNext(points || 0, level || 1)} XP to next</div>
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
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                  : "hover:bg-muted",
              )}
              aria-current={active === item.label ? "page" : undefined}
              onClick={() => setActive(item.label)}
            >
              <item.icon
                className={cn(
                  "h-3 w-3 transition-colors",
                  active === item.label ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
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
          onClick={handleThemeToggle}
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
      if (response.success && response.data) {
        const createdPost = (response.data as any).post || response.data
        // Dispatch optimistic update event for feeds to consume
        try {
          window.dispatchEvent(new CustomEvent('post:created', { detail: createdPost }))
        } catch (e) {
          console.debug('Failed to dispatch post:created event', e)
        }

        toast({ title: "Success", description: "Post created successfully!" })
        setShowPostModal(false)
        // No full reload - optimistic UI will update feed
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create post", variant: "destructive" })
    }
  }

  return (
    <>
      <Button 
        className="flex-1 text-xs h-7"
        onClick={() => setShowPostModal(true)}
      >
        <Plus className="mr-1 h-3 w-3" />
        Create
      </Button>
      
      <SimplePostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={handleCreatePost}
      />
    </>
  )
}

function NotificationButton() {
  const { state } = useApp()
  const router = useRouter()

  return (
    <Button 
      variant="secondary" 
      className="flex-1 gap-1 text-xs h-7 relative"
      onClick={() => router.push('/notifications')}
    >
      <Bell className="h-3 w-3" />
      {state.unreadCount > 0 ? (
        <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium leading-none rounded-full bg-red-600 text-white">
          {state.unreadCount > 99 ? '99+' : state.unreadCount}
        </span>
      ) : null}
    </Button>
  )
}