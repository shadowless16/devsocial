"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/avatar-utils"
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
        console.log("[RightRail] Trending response:", response)
        if (response.success && response.data) {
          const topics = (response.data as any).trendingTopics || []
          console.log("[RightRail] Setting trending topics:", topics)
          setTrendingTopics(topics)
        } else {
          console.log("[RightRail] No trending data received")
          setTrendingTopics([])
        }
      } catch (error) {
        console.error("[RightRail] Failed to fetch trending:", error)
        setTrendingTopics([])
      } finally {
        setLoading(false)
      }
    }
    fetchTrending()
  }, [])

  return (
    <Card className="border-0 ring-1 ring-black/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 text-sm">📈</span>
          <div className="text-sm font-semibold">Trending Tags</div>
        </div>
      </CardHeader>
      <CardContent className="pb-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : trendingTopics.length === 0 ? (
          <div className="text-xs text-muted-foreground py-2">No trending topics available</div>
        ) : (
          <>
            {trendingTopics.slice(0, 6).map((topic, index) => (
              <Link key={`${topic.tag}-${index}`} href={`/tag/${topic.tag.replace(/^#+/, '')}`} className="flex items-center justify-between py-1 hover:bg-muted/50 rounded px-1 -mx-1 transition-colors cursor-pointer">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-600 font-medium text-sm">#{topic.tag.replace(/^#+/, '')}</span>

                  {/* nicer React-friendly SVG icons instead of emojis */}
                  {topic.trend === "up" ? (
                    <svg
                      className="w-3 h-3 text-green-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      role="img"
                    >
                      <title>Trending up</title>
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                  ) : topic.trend === "down" ? (
                    <svg
                      className="w-3 h-3 text-red-500 transform rotate-180"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      role="img"
                    >
                      <title>Trending down</title>
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                  ) : null}
                </div>

                <div className="text-sm font-semibold text-gray-900">
                  {typeof topic.posts === 'number' ? topic.posts.toLocaleString() : topic.posts}
                </div>
              </Link>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function TopDevs() {
  const [topDevelopers, setTopDevelopers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<'all-time' | 'weekly'>('all-time')

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getLeaderboard({ limit: "3", type: currentView })
        if (response.success && response.data) {
          const lb = (response.data as any).leaderboard || []
          console.debug("[RightRail] leaderboard response:", lb)
          setTopDevelopers(lb)
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [currentView])

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView(prev => prev === 'all-time' ? 'weekly' : 'all-time')
    }, 7000)

    return () => clearInterval(interval)
  }, [])

  const toggleView = () => {
    setCurrentView(prev => prev === 'all-time' ? 'weekly' : 'all-time')
  }

  return (
    <Card className="border-0 ring-1 ring-black/5">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold">Top Developers</div>
          <button
            onClick={toggleView}
            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            {currentView === 'all-time' ? 'All Time' : 'Weekly'}
          </button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2">
        {loading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="w-3 h-3 animate-spin" />
          </div>
        ) : topDevelopers.length === 0 ? (
          <div className="text-xs text-muted-foreground">No developers yet</div>
        ) : (
          <>
            {topDevelopers.map((dev, i) => {
            const username = dev.user?.username || dev.username
            const displayName = dev.user?.displayName || dev.displayName || username
            // Resolve XP from multiple possible shapes returned by different leaderboard APIs
            const rawXp = dev.user?.points ?? dev.points ?? dev.totalXP ?? dev.xp ?? dev.totalXp ?? 0
            const xp = typeof rawXp === 'number' ? rawXp : parseInt(rawXp || '0', 10) || 0
            const formattedXp = xp > 999 ? `${(xp / 1000).toFixed(1)}k` : xp.toLocaleString()
            return (
              <div key={username} className="flex items-center gap-2">
                <div className="text-[10px] w-3 text-muted-foreground">{i + 1}</div>
                <Avatar 
                  className="h-5 w-5 ring-1 ring-emerald-100 cursor-pointer hover:ring-emerald-200 transition-all"
                  onClick={() => window.location.href = `/profile/${username}`}
                >
                  <AvatarImage 
                    src={getAvatarUrl(dev.user?.avatar || dev.avatar)} 
                    alt={displayName}
                  />
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
                <div className="text-emerald-700 text-xs">{formattedXp}</div>
                <div className="text-[10px] text-muted-foreground">XP</div>
              </div>
            )
            })}
          </>
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