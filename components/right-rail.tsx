"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function RightRail() {
  return (
    <div className="grid gap-4">
      <Trends />
      <TopDevs />
      <CommunityPoll />
    </div>
  )
}

function Trends() {
  const [trendingTopics, setTrendingTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await apiClient.getTrendingData("today")
        if (response.success && response.data) {
          setTrendingTopics((response.data as any).trendingTopics || [])
        }
      } catch (error) {
        console.error("Failed to fetch trending:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTrending()
  }, [])

  return (
    <Card className="border-0 ring-1 ring-black/5">
      <CardHeader className="pb-1">
        <div className="text-xs font-semibold">Trending Tags</div>
      </CardHeader>
      <CardContent className="pb-2">
        {loading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="w-3 h-3 animate-spin" />
          </div>
        ) : trendingTopics.length === 0 ? (
          <div className="text-xs text-muted-foreground">No trending topics yet</div>
        ) : (
          <div className="space-y-1">
            {trendingTopics.slice(0, 3).map((topic, index) => (
              <div key={topic.tag} className="flex items-center justify-between text-xs">
                <span className="text-emerald-600">#{topic.tag}</span>
                <span className="text-muted-foreground">{topic.posts}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TopDevs() {
  const [topDevelopers, setTopDevelopers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await apiClient.getLeaderboard({ limit: "3", type: "all-time" })
        if (response.success && response.data) {
          setTopDevelopers((response.data as any).leaderboard || [])
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  return (
    <Card className="border-0 ring-1 ring-black/5">
      <CardHeader className="pb-1">
        <div className="text-xs font-semibold">Top Developers</div>
      </CardHeader>
      <CardContent className="grid gap-2">
        {loading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="w-3 h-3 animate-spin" />
          </div>
        ) : topDevelopers.length === 0 ? (
          <div className="text-xs text-muted-foreground">No developers yet</div>
        ) : (
          topDevelopers.map((dev, i) => {
            const username = dev.user?.username || dev.username
            const displayName = dev.user?.displayName || dev.displayName || username
            return (
              <div key={username} className="flex items-center gap-2">
                <div className="text-[10px] w-3 text-muted-foreground">{i + 1}</div>
                <Avatar 
                  className="h-5 w-5 ring-1 ring-emerald-100 cursor-pointer hover:ring-emerald-200 transition-all"
                  onClick={() => window.location.href = `/profile/${username}`}
                >
                  <AvatarImage src={dev.user?.avatar || dev.avatar || "/diverse-avatars.png"} alt={displayName} />
                  <AvatarFallback className="text-[10px]">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div 
                    className="truncate text-xs font-medium cursor-pointer hover:text-emerald-500 transition-colors"
                    onClick={() => window.location.href = `/profile/${username}`}
                  >{displayName}</div>
                  <div 
                    className="truncate text-[10px] text-muted-foreground cursor-pointer hover:text-emerald-500 transition-colors"
                    onClick={() => window.location.href = `/profile/${username}`}
                  >@{username}</div>
                </div>
                <div className="text-emerald-700 text-xs">{dev.totalXP || 0}</div>
                <div className="text-[10px] text-muted-foreground">XP</div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

function CommunityPoll() {
  const data = [
    { label: "React", value: 60, tone: "emerald" as const },
    { label: "Vue", value: 27, tone: "emerald" as const },
    { label: "Angular", value: 13, tone: "emerald" as const },
  ]
  return (
    <Card className="border-0 ring-1 ring-black/5">
      <CardHeader className="pb-1">
        <div className="text-xs font-semibold">Community Poll</div>
        <div className="text-xs text-muted-foreground">{"What's your favorite frontend framework?"}</div>
      </CardHeader>
      <CardContent className="grid gap-2">
        {data.map((d) => (
          <div key={d.label} className="grid gap-0.5">
            <div className="flex items-center justify-between text-xs">
              <span>{d.label}</span>
              <span className="text-muted-foreground">
                {d.value}
                {"%"}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted">
              <div
                className={`h-1.5 rounded-full bg-emerald-600 transition-[width] duration-700`}
                style={{ width: `${d.value}%` }}
                aria-label={`${d.label} ${d.value} percent`}
              />
            </div>
          </div>
        ))}
        <div className="pt-0.5 text-[10px] text-muted-foreground">75 votes</div>
      </CardContent>
    </Card>
  )
}