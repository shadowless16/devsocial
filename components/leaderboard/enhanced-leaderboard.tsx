"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SmartAvatar } from "@/components/ui/smart-avatar"
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

const LeaderboardContent = memo(function LeaderboardContent({ leaderboard, activeTab, getStatValue, getStatLabel }: {
  leaderboard: LeaderboardEntry[]
  activeTab: string
  getStatValue: (entry: LeaderboardEntry, type: string) => number
  getStatLabel: (type: string) => string
}) {
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
              <div className="flex-shrink-0 w-5 sm:w-6 flex justify-center">
                {position <= 3 ? (
                  position === 1 ? <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" /> :
                  position === 2 ? <Medal className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" /> :
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                ) : (
                  <span className="text-[10px] sm:text-xs font-bold text-gray-500">#{position}</span>
                )}
              </div>

              <UserLink username={entry.user.username}>
                <SmartAvatar
                  src={entry.user.avatar}
                  username={entry.user.username}
                  level={entry.user.level}
                  alt={entry.user.displayName || entry.user.username}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0"
                  showLevelFrame={false}
                />
              </UserLink>

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

  const { realtimeData, isConnected } = useRealtimeLeaderboard(activeTab)

  const fetchLeaderboard = useCallback(async (type: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/gamification/leaderboard?type=${type}&limit=50`)
      const data = await response.json()
      if (data.success) {
        setLeaderboard(data.data.leaderboard)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed'
      console.error("Error fetching leaderboard:", errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard(activeTab)
  }, [activeTab, fetchLeaderboard])

  useEffect(() => {
    if (realtimeData) {
      setLeaderboard(realtimeData)
    }
  }, [realtimeData])

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

      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto gap-1 bg-gray-100 dark:bg-gray-800 p-1">
            {leaderboardTypes.map((type) => {
              const Icon = type.icon
              return (
                <TabsTrigger
                  key={type.key}
                  value={type.key}
                  className="text-[9px] sm:text-xs py-1.5 sm:py-2 px-1 sm:px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                >
                  <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" />
                  <span className="hidden sm:inline">{type.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {leaderboardTypes.map((type) => (
            <TabsContent key={type.key} value={type.key} className="mt-0">
              <LeaderboardContent
                leaderboard={leaderboard}
                activeTab={activeTab}
                getStatValue={getStatValue}
                getStatLabel={getStatLabel}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
