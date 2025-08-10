"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, Users, BarChart3, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { UserLink } from "@/components/shared/UserLink"

interface TrendingTopic {
  tag: string
  posts: number
  growth: string
  trend: string
  description: string
}

interface TopDeveloper {
  username?: string
  displayName?: string
  avatar?: string
  level?: number
  totalXP?: number
  postsThisWeek?: number
  totalEngagement?: number
  growthRate?: string
  user?: {
    username: string
    displayName: string
    avatar: string
    level: number
  }
}

const polls = [
  {
    id: 1,
    question: "What's your favorite frontend framework?",
    options: [
      { text: "React", votes: 45, percentage: 60 },
      { text: "Vue", votes: 20, percentage: 27 },
      { text: "Angular", votes: 10, percentage: 13 },
    ],
    totalVotes: 75,
  },
]

interface RightSidebarProps {
  collapsed?: boolean;
}

export function RightSidebar({ collapsed = false }: RightSidebarProps) {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [topDevelopers, setTopDevelopers] = useState<TopDeveloper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTrendingData()
    fetchLeaderboard()
  }, [])

  if (collapsed) {
    return (
      <div className="h-full flex flex-col items-center py-2 space-y-2">
        <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-900/20 rounded flex items-center justify-center">
          <TrendingUp className="w-2 h-2 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/20 rounded flex items-center justify-center">
          <Users className="w-2 h-2 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="w-4 h-4 bg-purple-100 dark:bg-purple-900/20 rounded flex items-center justify-center">
          <BarChart3 className="w-2 h-2 text-purple-600 dark:text-purple-400" />
        </div>
      </div>
    )
  }

  const fetchTrendingData = async () => {
    try {
      const response = await apiClient.getTrendingData("today")
      console.log("[RightSidebar] Trending API response:", response)
      if (response.success && response.data) {
        const topics = (response.data as any).trendingTopics || []
        console.log("[RightSidebar] Trending topics:", topics)
        setTrendingTopics(topics)
      }
    } catch (error: any) {
      console.error("Failed to fetch trending data:", error)
      setError("Failed to load trending data")
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const response = await apiClient.getLeaderboard({ limit: "6", type: "all-time" })
      if (response.success && response.data) {
        setTopDevelopers((response.data as any).leaderboard || [])
      }
    } catch (error: any) {
      console.error("Failed to fetch leaderboard:", error)
      setError("Failed to load top developers")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-2 space-y-2 w-full">
      {/* Trending Tags */}
      <Card className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
            Trending Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : error || trendingTopics.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
              No trending topics yet
            </div>
          ) : (
            trendingTopics.slice(0, 5).map((item, index) => (
              <div
                key={item.tag}
                className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center space-x-2">
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-sm px-2 py-1">
                    #{item.tag}
                  </Badge>
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.posts?.toLocaleString() || 0}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Top Developers */}
      <Card className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
            <Users className="w-4 h-4 mr-2 text-purple-500" />
            Top Developers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : error || topDevelopers.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
              No developers yet
            </div>
          ) : (
            topDevelopers.slice(0, 3).map((dev, index) => {
              const username = dev.user?.username || dev.username;
              return username ? (
                <UserLink key={username} username={username}>
                  <div className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded cursor-pointer transition-all duration-200">
                    <div className="flex items-center justify-center w-6 h-6 text-sm font-bold text-gray-600 dark:text-gray-400">
                      {index + 1}
                    </div>
                    <Avatar className="w-10 h-10 border border-gray-100 dark:border-gray-700">
                      <AvatarImage src={dev.user?.avatar || dev.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-emerald-500 text-white font-semibold text-sm">
                        {((dev.user?.displayName || dev.user?.username || dev.displayName || dev.username || "U"))
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {dev.user?.displayName || dev.displayName || dev.user?.username || dev.username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">@{username}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {(dev.totalXP || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">XP</p>
                    </div>
                  </div>
                </UserLink>
              ) : null;
            })
          )}
        </CardContent>
      </Card>

      {/* Community Poll */}
      <Card className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
            Community Poll
          </CardTitle>
        </CardHeader>
        <CardContent>
          {polls.map((poll) => (
            <div key={poll.id} className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white text-base">
                {poll.question}
              </h4>
              <div className="space-y-3">
                {poll.options.map((option, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">{option.text}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{option.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-emerald-500 dark:bg-emerald-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${option.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{poll.totalVotes} votes</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
