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

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1">
            {leaderboardTypes.map((type) => {
              const Icon = type.icon
              return (
                <TabsTrigger key={type.key} value={type.key} className="flex items-center justify-center space-x-1 text-xs sm:text-sm p-2">
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                  <span className="sm:hidden text-[10px]">{type.label.split(' ')[0]}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {leaderboardTypes.map((type) => (
            <TabsContent key={type.key} value={type.key} className="mt-6">
              {leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <type.icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No data available</p>
                  <p className="text-sm text-gray-400">Be the first to appear on this leaderboard!</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {leaderboard.map((entry, index) => {
                    const position = index + 1
                    return (
                      <div
                        key={entry._id}
                        className={`flex items-center space-x-2 sm:space-x-4 p-3 sm:p-4 rounded-lg border transition-all hover:shadow-md ${
                          position <= 3
                            ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        {/* Rank */}
                        <div className="flex-shrink-0">{getRankIcon(position)}</div>

                        {/* User Info */}
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <UserLink username={entry.user.username}>
                            <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                              <AvatarImage src={entry.user.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs sm:text-sm">
                                {(entry.user.displayName || entry.user.username || 'U')
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          </UserLink>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                              <UserLink username={entry.user.username}>
                                <h3 className="font-semibold text-sm sm:text-base text-gray-900 hover:text-emerald-600 transition-colors truncate max-w-[120px] sm:max-w-none">{entry.user.displayName || entry.user.username}</h3>
                              </UserLink>
                              <Badge variant="outline" className="text-[10px] sm:text-xs text-emerald-600 border-emerald-200 px-1 flex-shrink-0">
                                L{entry.user.level}
                              </Badge>
                              {position <= 3 && <Badge className={`${getRankBadgeColor(position)} text-[10px] sm:text-xs px-1 flex-shrink-0`}>#{position}</Badge>}
                            </div>
                            <UserLink username={entry.user.username}>
                              <p className="text-xs sm:text-sm text-gray-500 hover:text-emerald-600 transition-colors truncate max-w-[120px] sm:max-w-none">@{entry.user.username}</p>
                            </UserLink>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center space-x-3 sm:space-x-6 text-xs sm:text-sm">
                          <div className="text-center">
                            <div className="flex items-center space-x-1">
                              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                              <span className="font-bold text-gray-900 text-xs sm:text-sm">
                                {getStatValue(entry, activeTab).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-500">{getStatLabel(activeTab)}</p>
                          </div>

                          {activeTab === "all-time" && (
                            <>
                              <div className="text-center hidden sm:block">
                                <p className="font-medium text-gray-900">{entry.totalPosts || 0}</p>
                                <p className="text-xs text-gray-500">Posts</p>
                              </div>
                              <div className="text-center hidden sm:block">
                                <p className="font-medium text-gray-900">{entry.totalLikes || 0}</p>
                                <p className="text-xs text-gray-500">Likes</p>
                              </div>
                            </>
                          )}

                          {activeTab === "challenges" && entry.firstCompletions && (
                            <div className="text-center hidden sm:block">
                              <div className="flex items-center space-x-1">
                                <Crown className="w-4 h-4 text-yellow-500" />
                                <span className="font-bold text-gray-900">{entry.firstCompletions}</span>
                              </div>
                              <p className="text-xs text-gray-500">First!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
