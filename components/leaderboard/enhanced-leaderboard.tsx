"use client"

import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/avatar-utils"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Users, Zap, Target, TrendingUp, Crown } from "lucide-react"
import { useRealtimeLeaderboard } from "@/hooks/use-realtime-leaderboard"
import { UserLink } from "@/components/shared/UserLink"
import { LeaderboardSkeleton } from "@/components/skeletons/leaderboard-skeleton"

interface LeaderboardEntry {
  _id: string
  user: {
    _id: string
    username: string
    displayName: string
    avatar?: string
    level: number
  }
  totalXP: number
  totalPosts?: number
  totalLikes?: number
  totalComments?: number
  referralCount?: number
  challengesCompleted?: number
  firstCompletions?: number
  rank: number
  level: number
}

const leaderboardTypes = [
  { key: "weekly", label: "This Week", icon: TrendingUp },
  { key: "monthly", label: "This Month", icon: Medal },
  { key: "all-time", label: "All Time", icon: Trophy },
  { key: "referrals", label: "Referrals", icon: Users },
  { key: "challenges", label: "Challenges", icon: Target },
]

const LeaderboardContent = memo(({ leaderboard, activeTab, getStatValue, getStatLabel }: {
  leaderboard: LeaderboardEntry[]
  activeTab: string
  getStatValue: (entry: LeaderboardEntry, type: string) => number
  getStatLabel: (type: string) => string
}) => {
  if (leaderboard.length === 0) {
    return (
      <div className="mt-4">
        <div className="text-center py-6">
          <Trophy className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No data available</p>
          <p className="text-xs text-gray-400">Be the first to appear!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3 sm:mt-4">
      <div className="space-y-1.5 sm:space-y-2">
        {leaderboard.map((entry, index) => {
          const position = index + 1
          return (
            <div
              key={entry._id}
              className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-all w-full ${
                position <= 3
                  ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-700/30"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              }`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-5 sm:w-6 flex justify-center">
                {position <= 3 ? (
                  position === 1 ? <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" /> :
                  position === 2 ? <Medal className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" /> :
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                ) : (
                  <span className="text-[10px] sm:text-xs font-bold text-gray-500">#{position}</span>
                )}
              </div>

              {/* Avatar */}
              <UserLink username={entry.user.username}>
                <Avatar className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0">
                  <AvatarImage src={getAvatarUrl(entry.user.avatar) || "/placeholder.svg"} />
                  <AvatarFallback className="text-[10px] sm:text-xs">
                    {(entry.user.displayName || entry.user.username || 'U')
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </UserLink>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2">
                  <UserLink username={entry.user.username}>
                    <h3 className="font-medium text-[11px] sm:text-xs text-gray-900 truncate">
                      {entry.user.displayName || entry.user.username}
                    </h3>
                  </UserLink>
                  <Badge variant="outline" className="text-[8px] sm:text-[9px] text-emerald-600 border-emerald-200 px-1 py-0 flex-shrink-0">
                    L{entry.user.level}
                  </Badge>
                </div>
                <UserLink username={entry.user.username}>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">
                    @{entry.user.username}
                  </p>
                </UserLink>
              </div>

              {/* Stats */}
              <div className="text-right flex-shrink-0 min-w-0">
                <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                  <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500 flex-shrink-0" />
                  <span className="font-bold text-[10px] sm:text-xs text-gray-900">
                    {getStatValue(entry, activeTab) > 999 
                      ? `${(getStatValue(entry, activeTab) / 1000).toFixed(1)}k`
                      : getStatValue(entry, activeTab).toLocaleString()
                    }
                  </span>
                </div>
                <p className="text-[8px] sm:text-[9px] text-gray-500">{getStatLabel(activeTab)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

export function EnhancedLeaderboard() {
  const [activeTab, setActiveTab] = useState("weekly")
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Use real-time leaderboard hook
  const { realtimeData, isConnected } = useRealtimeLeaderboard(activeTab)

  useEffect(() => {
    fetchLeaderboard(activeTab)
  }, [activeTab])

  useEffect(() => {
    if (realtimeData) {
      setLeaderboard(realtimeData)
    }
  }, [realtimeData])

  const fetchLeaderboard = useCallback(async (type: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/leaderboard?type=${type}&limit=50`)
      const data = await response.json()
      if (data.success) {
        setLeaderboard(data.data.leaderboard)
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{position}</span>
        )
    }
  }

  const getRankBadgeColor = (position: number) => {
    if (position <= 3) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
    if (position <= 10) return "bg-gradient-to-r from-emerald-400 to-emerald-600 text-white"
    return "bg-gray-100 text-gray-700"
  }

  const getStatLabel = useCallback((type: string) => {
    switch (type) {
      case "referrals":
        return "Referrals"
      case "challenges":
        return "Challenges"
      default:
        return "XP"
    }
  }, [])

  const getStatValue = useCallback((entry: LeaderboardEntry, type: string) => {
    switch (type) {
      case "referrals":
        return entry.referralCount || 0
      case "challenges":
        return entry.challengesCompleted || 0
      default:
        return entry.totalXP
    }
  }, [])

  if (loading) {
    return <LeaderboardSkeleton />
  }

  return (
    <Card className="w-full border-0 shadow-sm">
      <CardHeader className="pb-2 sm:pb-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-1.5 sm:gap-2">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              <span className="text-sm sm:text-base md:text-lg font-bold">Leaderboard</span>
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs md:text-sm mt-0.5">
              <span className="hidden sm:inline">Top performers in the DevSocial community</span>
              <span className="sm:hidden">Top performers</span>
              {isConnected && <span className="text-green-500 ml-1 sm:ml-2">• Live</span>}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 sm:px-4 md:px-6 pb-4">
        <div className="w-full">
          {/* Mobile-optimized tabs */}
          <div className="overflow-x-auto scrollbar-hide mb-3 sm:mb-4">
            <div className="flex gap-1 sm:gap-2 min-w-max pb-1">
              {leaderboardTypes.map((type) => {
                const Icon = type.icon
                const isActive = activeTab === type.key
                return (
                  <button
                    key={type.key}
                    onClick={() => setActiveTab(type.key)}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-[10px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                      isActive 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                    <span className="hidden sm:inline">{type.label}</span>
                    <span className="sm:hidden">
                      {type.key === 'weekly' ? 'Week' : 
                       type.key === 'monthly' ? 'Month' : 
                       type.key === 'all-time' ? 'All' : 
                       type.key === 'referrals' ? 'Refs' : 'Quest'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <LeaderboardContent 
            leaderboard={leaderboard} 
            activeTab={activeTab} 
            getStatValue={getStatValue}
            getStatLabel={getStatLabel}
          />
        </div>
      </CardContent>
    </Card>
  )
}
