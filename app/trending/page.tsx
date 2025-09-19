"use client"

import { useState, useEffect } from "react"
import { TrendingUp, FlameIcon as Fire, Heart, Eye, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FeedItem } from "@/components/feed/FeedItem"
import { UserLink } from "@/components/shared/UserLink"
import { apiClient } from "@/lib/api-client"
import { TrendingSkeleton } from "@/components/skeletons/trending-skeleton"
import { formatTimeAgo } from "@/lib/time-utils"
import Link from "next/link"

interface TrendingPost {
  id: string
  _id?: string
  author: {
    username: string
    displayName: string
    avatar: string
    level: number
  }
  content: string
  imageUrl?: string | null
  tags: string[]
  likesCount: number
  commentsCount: number
  viewsCount: number
  xpAwarded: number
  createdAt: string
  isAnonymous: boolean
  isLiked: boolean
  trendingScore?: number
  engagementRate?: number
}

interface TrendingTopic {
  tag: string
  posts: number
  growth: string
  trend: string
  description: string
}

interface TrendingUser {
  username: string
  displayName: string
  avatar: string
  level: number
  postsThisWeek?: number
  totalEngagement?: number
  growthRate?: string
}

interface TrendingStats {
  hotPosts: number
  growth: string
  totalViews: string
  engagements: string
}

interface TrendingData {
  trendingPosts: TrendingPost[];
  trendingTopics: TrendingTopic[];
  risingUsers: TrendingUser[];
  stats: TrendingStats;
}

export default function PublicTrendingPage() {
  const [activeTab, setActiveTab] = useState("posts")
  const [timeFilter, setTimeFilter] = useState("today")
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([])
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [trendingUsers, setTrendingUsers] = useState<TrendingUser[]>([])
  const [stats, setStats] = useState<TrendingStats>({
    hotPosts: 0,
    growth: "+0%",
    totalViews: "0",
    engagements: "0"
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    fetchTrendingData()
  }, [timeFilter])

  const fetchTrendingData = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await apiClient.getTrendingData<TrendingData>(timeFilter)
      console.log("[PublicTrendingPage] API response:", response)
      if (response.success && response.data) {
        setTrendingPosts(response.data.trendingPosts || [])
        setTrendingTopics(response.data.trendingTopics || [])
        setTrendingUsers(response.data.risingUsers || [])
        setStats(response.data.stats || stats)
      } else {
        setError("No trending data available")
      }
    } catch (error: any) {
      console.error("[PublicTrendingPage] Failed to fetch trending data:", error)
      setError("Unable to load trending data. Please try again later.")
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }

  if (loading && initialLoad) {
    return <TrendingSkeleton />
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header with login prompt */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-3 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-orange-400 to-red-500 p-2 rounded-full">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy-900">DevSocial Trending</h1>
                <p className="text-sm text-gray-600">Discover what's hot in the developer community</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/auth/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Join Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-3 md:px-6 py-6">
        {/* Time Filter */}
        <div className="flex justify-center mb-4 md:mb-6">
          <div className="bg-gray-100 p-1 rounded-lg w-full max-w-sm md:w-auto">
            {["today", "week", "month"].map((filter) => (
              <Button
                key={filter}
                variant={timeFilter === filter ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeFilter(filter)}
                className={`capitalize flex-1 md:flex-none text-xs md:text-sm ${
                  timeFilter === filter ? "bg-white shadow-sm text-navy-900" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {filter === "today" ? "Today" : `This ${filter}`}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-1 md:mb-2">
                <Fire className="w-4 h-4 md:w-5 md:h-5 text-orange-500 mr-1 md:mr-2" />
                <span className="text-sm md:text-lg font-bold text-gray-900">{stats.hotPosts}</span>
              </div>
              <div className="text-xs md:text-sm text-gray-600">Hot Posts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-1 md:mb-2">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-1 md:mr-2" />
                <span className="text-sm md:text-lg font-bold text-gray-900">{stats.growth}</span>
              </div>
              <div className="text-xs md:text-sm text-gray-600">Growth</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-1 md:mb-2">
                <Eye className="w-4 h-4 md:w-5 md:h-5 text-blue-500 mr-1 md:mr-2" />
                <span className="text-sm md:text-lg font-bold text-gray-900">{stats.totalViews}</span>
              </div>
              <div className="text-xs md:text-sm text-gray-600">Total Views</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-1 md:mb-2">
                <Heart className="w-4 h-4 md:w-5 md:h-5 text-red-500 mr-1 md:mr-2" />
                <span className="text-sm md:text-lg font-bold text-gray-900">{stats.engagements}</span>
              </div>
              <div className="text-xs md:text-sm text-gray-600">Engagements</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="posts" className="text-xs md:text-sm px-2 py-2">Trending Posts</TabsTrigger>
            <TabsTrigger value="topics" className="text-xs md:text-sm px-2 py-2">Hot Topics</TabsTrigger>
            <TabsTrigger value="users" className="text-xs md:text-sm px-2 py-2">Rising Stars</TabsTrigger>
          </TabsList>

          {/* Trending Posts */}
          <TabsContent value="posts" className="space-y-3 md:space-y-6 mt-4 md:mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">{error}</p>
                <Link href="/auth/signup">
                  <Button>Join DevSocial to see trending posts</Button>
                </Link>
              </div>
            ) : trendingPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No trending posts found for this period</p>
                <Link href="/auth/signup">
                  <Button>Join DevSocial to create posts</Button>
                </Link>
              </div>
            ) : (
              trendingPosts.map((post, index) => (
                <div key={post.id} className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      <Fire className="w-3 h-3 mr-1" />#{index + 1} Trending
                    </Badge>
                  </div>

                  <FeedItem 
                    post={{...post, id: post.id || post._id || '', createdAt: formatTimeAgo(post.createdAt)}} 
                    onLike={() => {
                      window.location.href = "/auth/login"
                    }} 
                  />
                </div>
              ))
            )}
          </TabsContent>

          {/* Hot Topics */}
          <TabsContent value="topics" className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-gray-500">
                {error}
              </div>
            ) : trendingTopics.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No trending topics found for this period
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingTopics.map((topic, index) => (
                  <Card key={topic.tag} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-emerald-100 text-emerald-800 text-lg px-3 py-1">#{topic.tag.replace(/^#+/, '')}</Badge>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">#{index + 1}</span>
                            {topic.trend === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
                          </div>
                        </div>
                        <Badge
                          className={`${
                            topic.trend === "up" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {topic.growth}
                        </Badge>
                      </div>

                      <p className="text-gray-600 text-sm mb-3">{topic.description}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">{topic.posts}</span>
                        <span className="text-sm text-gray-500">posts this {timeFilter === 'today' ? 'day' : timeFilter}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rising Stars */}
          <TabsContent value="users" className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-gray-500">
                {error}
              </div>
            ) : trendingUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No rising stars found for this period</p>
                <Link href="/auth/signup">
                  <Button>Join DevSocial to become a rising star</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingUsers.map((user, index) => (
                  <Card key={user.username} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {(user.displayName || user.username || 'U')
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {index + 1}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{user.displayName}</h4>
                            <p className="text-sm text-gray-600">@{user.username}</p>
                          </div>
                        </div>
                        {user.growthRate && (
                          <Badge className="bg-green-100 text-green-800">{user.growthRate}</Badge>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Level</span>
                          <span className="font-medium">{user.level}</span>
                        </div>
                        {user.postsThisWeek !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Posts this {timeFilter === 'today' ? 'day' : timeFilter}</span>
                            <span className="font-medium">{user.postsThisWeek}</span>
                          </div>
                        )}
                        {user.totalEngagement !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Engagement</span>
                            <span className="font-medium text-emerald-600">{user.totalEngagement.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <Link href="/auth/signup">
                        <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">Join to Follow</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}