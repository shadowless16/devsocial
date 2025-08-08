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

export function RightSidebar() {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [topDevelopers, setTopDevelopers] = useState<TopDeveloper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTrendingData()
    fetchLeaderboard()
  }, [])

  const fetchTrendingData = async () => {
    try {
      const response = await apiClient.getTrendingData("today")
      if (response.success && response.data) {
        setTrendingTopics((response.data as any).trendingTopics || [])
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
    <div className="h-full overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
      {/* Trending Tags */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center text-gray-900 dark:text-white">
            <TrendingUp className="w-4 h-4 mr-2 text-orange-500 dark:text-orange-400" />
            Trending Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
              Failed to load trending tags
            </div>
          ) : trendingTopics.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
              No trending topics yet
            </div>
          ) : (
            trendingTopics.slice(0, 6).map((item, index) => (
              <div
                key={item.tag}
                className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700">
                    {item.tag}
                  </Badge>
                  {item.trend === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
                  {item.trend === "down" && <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.posts?.toLocaleString() || 0}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Top Developers */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center text-gray-900 dark:text-white">
            <Users className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400" />
            Top Developers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
              Failed to load top developers
            </div>
          ) : topDevelopers.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
              No developers yet
            </div>
          ) : (
            topDevelopers.map((dev, index) => {
              const username = dev.user?.username || dev.username;
              return username ? (
                <UserLink key={username} username={username}>
                  <div className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg cursor-pointer transition-colors">
                    <div className="flex items-center justify-center w-6 h-6 text-xs font-bold text-gray-600 dark:text-gray-400">{index + 1}</div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={dev.user?.avatar || dev.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {((dev.user?.displayName || dev.user?.username || dev.displayName || dev.username || "U"))
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{dev.user?.displayName || dev.displayName || dev.user?.username || dev.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">@{username}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{(dev.totalXP || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">XP</p>
                    </div>
                  </div>
                </UserLink>
              ) : (
                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg">
                  <div className="flex items-center justify-center w-6 h-6 text-xs font-bold text-gray-600 dark:text-gray-400">{index + 1}</div>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={dev.avatar || "/placeholder.svg"} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Unknown User</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@unknown</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{(dev.totalXP || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">XP</p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Polls */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center text-gray-900 dark:text-white">
            <BarChart3 className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
            Community Poll
          </CardTitle>
        </CardHeader>
        <CardContent>
          {polls.map((poll) => (
            <div key={poll.id} className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">{poll.question}</h4>
              <div className="space-y-2">
                {poll.options.map((option, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{option.text}</span>
                      <span className="text-gray-500 dark:text-gray-400">{option.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-emerald-500 dark:bg-emerald-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${option.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{poll.totalVotes} votes</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
