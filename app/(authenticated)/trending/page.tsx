"use client"

import { useState, useEffect } from "react"
import { TrendingUp, FlameIcon as Fire, Heart, Eye, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeedItem } from "@/components/feed/FeedItem"
import { UserLink } from "@/components/shared/UserLink"
import { apiClient } from "@/lib/api-client"
import { TrendingSkeleton } from "@/components/skeletons/trending-skeleton"

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

interface LikeResponse {
  liked: boolean;
  likesCount: number;
}

export default function TrendingPage() {
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

  useEffect(() => {
    fetchTrendingData()
  }, [timeFilter])

  const fetchTrendingData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getTrendingData<TrendingData>(timeFilter)
      if (response.success && response.data) {
        setTrendingPosts(response.data.trendingPosts || [])
        setTrendingTopics(response.data.trendingTopics || [])
        setTrendingUsers(response.data.risingUsers || [])
        setStats(response.data.stats || stats)
      }
    } catch (error: any) {
      console.error("Failed to fetch trending data:", error)
      setError("Failed to load trending data")
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!postId || postId === 'undefined') {
      console.error('Invalid post ID:', postId)
      return
    }
    
    try {
      const response = await apiClient.togglePostLike<LikeResponse>(postId)
      if (response.success && response.data) {
        const { liked, likesCount } = response.data;
        setTrendingPosts(
          trendingPosts.map((post) =>
            (post.id || post._id) === postId
              ? {
                  ...post,
                  isLiked: liked,
                  likesCount: likesCount,
                }
              : post,
          ),
        )
      }
    } catch (error) {
      console.error("Failed to toggle like:", error)
    }
  }

  if (loading) {
    return <TrendingSkeleton />
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-orange-400 to-red-500 p-3 rounded-full">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy-900 mb-2">Trending</h1>
        <p className="text-gray-600">Discover what's hot in the developer community</p>
      </div>

      {/* Time Filter */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-1 rounded-lg">
          {["today", "week", "month"].map((filter) => (
            <Button
              key={filter}
              variant={timeFilter === filter ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeFilter(filter)}
              className={`capitalize ${
                timeFilter === filter ? "bg-white shadow-sm text-navy-900" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {filter === "today" ? "Today" : `This ${filter}`}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Fire className="w-5 h-5 text-orange-500 mr-2" />
              <span className="text-lg font-bold text-gray-900">{stats.hotPosts}</span>
            </div>
            <div className="text-sm text-gray-600">Hot Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-lg font-bold text-gray-900">{stats.growth}</span>
            </div>
            <div className="text-sm text-gray-600">Growth</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Eye className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-lg font-bold text-gray-900">{stats.totalViews}</span>
            </div>
            <div className="text-sm text-gray-600">Total Views</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Heart className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-lg font-bold text-gray-900">{stats.engagements}</span>
            </div>
            <div className="text-sm text-gray-600">Engagements</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Trending Posts</TabsTrigger>
          <TabsTrigger value="topics">Hot Topics</TabsTrigger>
          <TabsTrigger value="users">Rising Stars</TabsTrigger>
        </TabsList>

        {/* Trending Posts */}
        <TabsContent value="posts" className="space-y-6 mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-gray-500">
              {error}
            </div>
          ) : trendingPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No trending posts found for this period
            </div>
          ) : (
            trendingPosts.map((post, index) => (
              <div key={post.id} className="relative">
                {/* Trending Badge */}
                <div className="absolute -top-2 -left-2 z-10">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <Fire className="w-3 h-3 mr-1" />#{index + 1} Trending
                  </Badge>
                </div>

                {/* Engagement Stats */}
                {(post.trendingScore || post.engagementRate) && (
                  <Card className="mb-2">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          {post.trendingScore && (
                            <div className="flex items-center space-x-1 text-gray-600">
                              <TrendingUp className="w-4 h-4" />
                              <span>Score: {post.trendingScore}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Eye className="w-4 h-4" />
                            <span>{post.likesCount + post.commentsCount} interactions</span>
                          </div>
                        </div>
                        {post.engagementRate && (
                          <div className="text-green-600 font-medium">{post.engagementRate}% engagement</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <FeedItem post={{...post, id: post.id || post._id || ''}} onLike={() => handleLike(post.id || post._id || '')} />
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
                        <Badge className="bg-emerald-100 text-emerald-800 text-lg px-3 py-1">{topic.tag}</Badge>
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
            <div className="text-center py-8 text-gray-500">
              No rising stars found for this period
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingUsers.map((user, index) => (
                <UserLink key={user.username} username={user.username}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img
                              src={user.avatar || "/placeholder.svg"}
                              alt={user.displayName}
                              className="w-12 h-12 rounded-full"
                            />
                            <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {index + 1}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors">{user.displayName}</h4>
                            <p className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">@{user.username}</p>
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

                      <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">View Profile</Button>
                    </CardContent>
                  </Card>
                </UserLink>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
