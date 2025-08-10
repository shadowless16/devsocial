"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  { key: "all-time", label: "All Time", icon: Trophy },
  { key: "weekly", label: "This Week", icon: TrendingUp },
  { key: "monthly", label: "This Month", icon: Medal },
  { key: "referrals", label: "Referrals", icon: Users },
  { key: "challenges", label: "Challenges", icon: Target },
]

export function EnhancedLeaderboard() {
  const [activeTab, setActiveTab] = useState("all-time")
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

  const fetchLeaderboard = async (type: string) => {
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
  }

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

  const getStatLabel = (type: string) => {
    switch (type) {
      case "referrals":
        return "Referrals"
      case "challenges":
        return "Challenges"
      default:
        return "XP"
    }
  }

  const getStatValue = (entry: LeaderboardEntry, type: string) => {
    switch (type) {
      case "referrals":
        return entry.referralCount || 0
      case "challenges":
        return entry.challengesCompleted || 0
      default:
        return entry.totalXP
    }
  }

  if (loading) {
    return <LeaderboardSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              <span className="text-base sm:text-lg">Leaderboard</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Top performers in the DevSocial community</span>
              <span className="sm:hidden">Top performers</span>
              {isConnected && <span className="text-green-500 ml-2">• Live</span>}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:px-6">
        <div className="w-full">
          <div className="flex overflow-x-auto scrollbar-hide mb-4">
            <div className="flex space-x-1 min-w-max">
              {leaderboardTypes.map((type) => {
                const Icon = type.icon
                const isActive = activeTab === type.key
                return (
                  <button
                    key={type.key}
                    onClick={() => setActiveTab(type.key)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      isActive 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{type.label}</span>
                    <span className="sm:hidden">{type.key === 'all-time' ? 'All' : type.key === 'weekly' ? 'Week' : type.key === 'monthly' ? 'Month' : type.key === 'referrals' ? 'Refs' : 'Quest'}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {activeTab && (
            <div className="mt-4">
              {leaderboard.length === 0 ? (
                <div className="text-center py-6">
                  <Trophy className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No data available</p>
                  <p className="text-xs text-gray-400">Be the first to appear!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => {
                    const position = index + 1
                    return (
                      <div
                        key={entry._id}
                        className={`flex items-center space-x-2 p-2 rounded-lg border transition-all ${
                          position <= 3
                            ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-700/30"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {/* Rank */}
                        <div className="flex-shrink-0 w-6">
                          {position <= 3 ? (
                            position === 1 ? <Crown className="w-4 h-4 text-yellow-500" /> :
                            position === 2 ? <Medal className="w-4 h-4 text-gray-400" /> :
                            <Award className="w-4 h-4 text-amber-600" />
                          ) : (
                            <span className="text-xs font-bold text-gray-500">#{position}</span>
                          )}
                        </div>

                        {/* Avatar */}
                        <UserLink username={entry.user.username}>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={entry.user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {(entry.user.displayName || entry.user.username || 'U')
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </UserLink>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1">
                            <UserLink username={entry.user.username}>
                              <h3 className="font-medium text-xs text-gray-900 truncate max-w-[100px]">{entry.user.displayName || entry.user.username}</h3>
                            </UserLink>
                            <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-200 px-1 py-0">
                              L{entry.user.level}
                            </Badge>
                          </div>
                          <UserLink username={entry.user.username}>
                            <p className="text-[10px] text-gray-500 truncate max-w-[100px]">@{entry.user.username}</p>
                          </UserLink>
                        </div>

                        {/* Stats */}
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            <span className="font-bold text-xs text-gray-900">
                              {getStatValue(entry, activeTab) > 999 
                                ? `${(getStatValue(entry, activeTab) / 1000).toFixed(1)}k`
                                : getStatValue(entry, activeTab)
                              }
                            </span>
                          </div>
                          <p className="text-[9px] text-gray-500">{getStatLabel(activeTab)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
