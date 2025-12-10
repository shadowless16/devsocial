"use client"

import type React from "react"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/core/utils"
import Link from "next/link"
import {
  BarChart3,
  Users,
  FileText,
  TrendingUp,
  Activity,
  Settings,
  ArrowLeft,
  Download,
  RefreshCw,
  Calendar,
  Moon,
  Sun,
} from "lucide-react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"

type NavItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  description?: string
}

const analyticsNav: NavItem[] = [
  {
    label: "Overview",
    icon: BarChart3,
    href: "/analytics",
    description: "Platform metrics & KPIs",
  },
  {
    label: "User Analytics",
    icon: Users,
    href: "/analytics/users",
    description: "User behavior & demographics",
  },
  {
    label: "Content Analytics",
    icon: FileText,
    href: "/analytics/content",
    description: "Posts, engagement & trends",
  },
  {
    label: "Growth Metrics",
    icon: TrendingUp,
    href: "/analytics/growth",
    description: "Acquisition & retention",
  },
  {
    label: "Real-time",
    icon: Activity,
    href: "/analytics/realtime",
    description: "Live platform activity",
  },
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="justify-start gap-2 bg-transparent"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </Button>
  )
}

export default function AnalyticsSidebar() {
  const pathname = usePathname()
  const [active, setActive] = useState(() => {
    const currentPath = pathname
    const activeItem = analyticsNav.find((item) => item.href === currentPath)
    return activeItem?.label || "Overview"
  })

  return (
    <div className="grid gap-4">
      {/* Analytics Portal Header */}
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-white shadow-sm">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div className="grid">
          <span className="text-lg font-semibold leading-none">Analytics Portal</span>
          <span className="text-xs text-muted-foreground">DevSocial Insights</span>
        </div>
      </div>

      {/* Back to Main Platform */}
      <Card className="border-0 p-3 ring-1 ring-black/5">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to DevSocial
        </Link>
      </Card>

      {/* Analytics User Info */}
      <Card className="border-0 p-4 ring-1 ring-black/5">
        <div className="flex items-center gap-3">
          <UserAvatar 
            user={{
              username: 'analytics',
              avatar: '/abstract-geometric-shapes.png',
              displayName: 'Analytics Team'
            }}
            className="h-10 w-10 ring-1 ring-blue-100"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="truncate font-medium">Analytics Team</div>
              <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">Admin</Badge>
            </div>
            <div className="text-xs text-muted-foreground">Read-only access</div>
          </div>
        </div>
      </Card>

      {/* Analytics Navigation */}
      <ScrollArea className="h-[50vh] rounded-md">
        <nav className="grid gap-1 pr-2">
          {analyticsNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group relative flex flex-col gap-1 rounded-lg px-3 py-3 text-sm transition-all",
                active === item.label ? "bg-blue-600/10 text-blue-700 ring-1 ring-blue-600/20" : "hover:bg-muted",
              )}
              aria-current={active === item.label ? "page" : undefined}
              onClick={() => setActive(item.label)}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    active === item.label ? "text-blue-700" : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span className="flex-1 truncate font-medium">{item.label}</span>
              </div>
              {item.description && <span className="text-xs text-muted-foreground ml-7">{item.description}</span>}
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* Quick Analytics Actions */}
      <div className="grid gap-2">
        <div className="text-xs font-medium text-muted-foreground">Quick Actions</div>
        <div className="grid gap-2">
          <Button variant="outline" className="justify-start gap-2 bg-transparent" size="sm">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" className="justify-start gap-2 bg-transparent" size="sm">
            <Calendar className="h-4 w-4" />
            Schedule Report
          </Button>
          <Button variant="outline" className="justify-start gap-2 bg-transparent" size="sm">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      <Separator />

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Analytics Settings */}
      <div className="grid gap-1">
        <Button variant="ghost" className="justify-start gap-2">
          <Settings className="h-4 w-4" />
          Analytics Settings
        </Button>
      </div>
    </div>
  )
}
