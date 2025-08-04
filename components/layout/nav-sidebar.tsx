// components/layout/nav-sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  TrendingUp,
  Target,
  Trophy,
  Settings,
  Plus,
  User as UserIcon, // Renamed to avoid conflict with User interface
  Shield,
  LogOut,
  Code2,
  Bell,
  Search,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { UserLink } from "@/components/shared/UserLink";
import { ThemeSwitch } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/auth-context";

const navigationItems = [
  { href: "/", icon: Home, label: "Home", badge: null },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", badge: null },
  { href: "/search", icon: Search, label: "Search", badge: null },
  { href: "/trending", icon: TrendingUp, label: "Trending", badge: null },
  { href: "/missions", icon: Target, label: "Missions", badge: 3 },
  { href: "/leaderboard", icon: Trophy, label: "Leaderboard", badge: null },
  { href: "/profile", icon: UserIcon, label: "My Profile", badge: null },
  { href: "/confess", icon: Plus, label: "Confess", badge: null },
  { href: "/referrals", icon: Users, label: "Referrals", badge: null },
  { href: "/challenges", icon: Target, label: "Challenges", badge: null },
  { href: "/moderation", icon: Shield, label: "Moderation", badge: null, adminOnly: true },
];

interface NavSidebarProps {
  onItemClick?: () => void;
}

export function NavSidebar({ onItemClick }: NavSidebarProps) {
  const pathname = usePathname();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();

  // Provide a default user object if not authenticated to prevent errors
  const displayUser = user || {
    username: "Guest",
    displayName: "Guest User",
    avatar: "/placeholder.svg",
    level: 0,
    points: 0, // Changed from xp to points
    xpToNext: 0,
    totalXpForLevel: 1000,
    role: "guest",
    bio: "",
    branch: "Other",
    bannerUrl: "",
    badges: [],
    isVerified: false,
    refreshTokens: [],
    loginStreak: 0,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo - Hidden on mobile since it's in the header */}
      <div className="hidden lg:block p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-lg">
            <Code2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-xl font-bold text-navy-900 dark:text-white">TechConnect</span>
        </div>
      </div>

      {/* User Profile Summary */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        {user ? (
          <UserLink username={user.username}>
            <div className="flex items-center space-x-3 mb-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 -m-2 transition-colors">
              <Avatar className="w-10 h-10">
                <AvatarImage src={displayUser.avatar || "/placeholder.svg"} />
                <AvatarFallback>{(displayUser.displayName ?? "G").charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{displayUser.displayName}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Level {displayUser.level}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">{(displayUser.points ?? 0).toLocaleString()} XP</p>
              </div>
            </div>
          </UserLink>
        ) : (
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={displayUser.avatar || "/placeholder.svg"} />
              <AvatarFallback>{(displayUser.displayName ?? "G").charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{displayUser.displayName}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Level {displayUser.level}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">{(displayUser.points ?? 0).toLocaleString()} XP</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            if (item.adminOnly && displayUser.role !== "admin") return null;

            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onItemClick}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Quick Actions</h3>
          <Button
            onClick={() => setShowCreatePost(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mb-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
          <Button
            onClick={() => setShowNotifications(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-2"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
            <Badge className="ml-auto bg-red-500 text-white text-xs px-2 py-1">3</Badge>
          </Button>

          {/* Level Progress */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Level {displayUser.level}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{displayUser.xpToNext} XP to next</span>
            </div>
            <Progress
              value={displayUser.totalXpForLevel > 0 ? (displayUser.points / displayUser.totalXpForLevel) * 100 : 0}
              className="h-2"
            />
          </div>
        </div>

        {/* Settings & Logout */}
        <div className="space-y-1">
          <Link
            href="/settings"
            onClick={onItemClick}
            className="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </Link>
          <div className="px-3 py-1">
            <ThemeSwitch />
          </div>
          <button
            onClick={() => {
              logout();
              if (onItemClick) onItemClick();
            }}
            className="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
      {showNotifications && (
        <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
}