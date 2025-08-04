"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Users, Zap, Target, TrendingUp, Crown } from "lucide-react"
import { useRealtimeLeaderboard } from "@/hooks/use-realtime-leaderboard"
import { UserLink } from "@/components/shared/UserLink"

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
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Loading rankings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Leaderboard</span>
            </CardTitle>
            <CardDescription>
              Top performers in the DevSocial community
              {isConnected && <span className="text-green-500 ml-2">• Live</span>}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {leaderboardTypes.map((type) => {
              const Icon = type.icon
              return (
                <TabsTrigger key={type.key} value={type.key} className="flex items-center space-x-1">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{type.label}</span>
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
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => {
                    const position = index + 1
                    return (
                      <div
                        key={entry._id}
                        className={`flex items-center space-x-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                          position <= 3
                            ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        {/* Rank */}
                        <div className="flex-shrink-0">{getRankIcon(position)}</div>

                        {/* User Info */}
                        <div className="flex items-center space-x-3 flex-1">
                          <UserLink username={entry.user.username}>
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={entry.user.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {entry.user.displayName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          </UserLink>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <UserLink username={entry.user.username}>
                                <h3 className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors">{entry.user.displayName}</h3>
                              </UserLink>
                              <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">
                                L{entry.user.level}
                              </Badge>
                              {position <= 3 && <Badge className={getRankBadgeColor(position)}>#{position}</Badge>}
                            </div>
                            <UserLink username={entry.user.username}>
                              <p className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">@{entry.user.username}</p>
                            </UserLink>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="text-center">
                            <div className="flex items-center space-x-1">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              <span className="font-bold text-gray-900">
                                {getStatValue(entry, activeTab).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{getStatLabel(activeTab)}</p>
                          </div>

                          {activeTab === "all-time" && (
                            <>
                              <div className="text-center">
                                <p className="font-medium text-gray-900">{entry.totalPosts || 0}</p>
                                <p className="text-xs text-gray-500">Posts</p>
                              </div>
                              <div className="text-center">
                                <p className="font-medium text-gray-900">{entry.totalLikes || 0}</p>
                                <p className="text-xs text-gray-500">Likes</p>
                              </div>
                            </>
                          )}

                          {activeTab === "challenges" && entry.firstCompletions && (
                            <div className="text-center">
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
