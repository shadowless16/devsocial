"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, Users, BarChart3, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface TrendingTopic {
  tag: string
  posts: number
  growth: string
  trend: string
  description: string
}

interface TopDeveloper {
  username: string
  displayName: string
  avatar: string
  level: number
  totalXP?: number
  postsThisWeek?: number
  totalEngagement?: number
  growthRate?: string
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
        setTrendingTopics(response.data.trendingTopics || [])
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
        setTopDevelopers(response.data.leaderboard || [])
      }
    } catch (error: any) {
      console.error("Failed to fetch leaderboard:", error)
      setError("Failed to load top developers")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Trending Tags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
            Trending Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-4 text-sm text-gray-500">
              Failed to load trending tags
            </div>
          ) : trendingTopics.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500">
              No trending topics yet
            </div>
          ) : (
            trendingTopics.slice(0, 6).map((item, index) => (
              <div
                key={item.tag}
                className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                    {item.tag}
                  </Badge>
                  {item.trend === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
                  {item.trend === "down" && <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />}
                </div>
                <span className="text-sm text-gray-500">{item.posts?.toLocaleString() || 0}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Top Developers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-500" />
            Top Developers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-4 text-sm text-gray-500">
              Failed to load top developers
            </div>
          ) : topDevelopers.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500">
              No developers yet
            </div>
          ) : (
            topDevelopers.map((dev, index) => (
              <div
                key={dev.user?.username || dev.username || index}
                className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-center w-6 h-6 text-xs font-bold text-gray-600">{index + 1}</div>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={dev.user?.avatar || dev.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                    {((dev.user?.displayName || dev.user?.username || dev.displayName || dev.username || "U"))
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{dev.user?.displayName || dev.displayName || dev.user?.username || dev.username}</p>
                  <p className="text-xs text-gray-500">@{dev.user?.username || dev.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-600">{(dev.totalXP || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">XP</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Polls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            Community Poll
          </CardTitle>
        </CardHeader>
        <CardContent>
          {polls.map((poll) => (
            <div key={poll.id} className="space-y-3">
              <h4 className="font-medium text-gray-900">{poll.question}</h4>
              <div className="space-y-2">
                {poll.options.map((option, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{option.text}</span>
                      <span className="text-gray-500">{option.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${option.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">{poll.totalVotes} votes</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
