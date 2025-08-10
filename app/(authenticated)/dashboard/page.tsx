"use client"

import { useState, useEffect } from "react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Activity, MessageSquare, Heart, Trophy, Target, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton"

interface DashboardData {
  user: {
    points: number
    level: number
    badges: string[]
    rank: number
  }
  stats: {
    posts: {
      totalPosts: number
      totalLikes: number
      totalComments: number
      avgLikes: number
      avgComments: number
    }
    xp: {
      breakdown: Array<{
        _id: string
        totalXP: number
        count: number
      }>
      total: number
    }
    engagement: {
      avgEngagementRate: number
      topPost: number
    }
  }
  charts: {
    dailyActivity: Array<{
      _id: string
      totalXP: number
      totalActivities: number
    }>
    period: string
  }
  achievements: Array<{
    type: string
    description: string
    createdAt: string
    metadata: any
  }>
  notifications: {
    unreadCount: number
  }
}

const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"]

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("week")
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [period])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log("Fetching dashboard data with period:", period)
      const response = await apiClient.getDashboard(period)
      console.log("Dashboard API response:", response)
      if (response.success && response.data) {
        console.log("Dashboard data received:", response.data)
        setDashboardData(response.data as DashboardData)
      } else {
        console.error("Dashboard API error:", response.message || "No data received")
        console.error("Full response:", response)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      if (error instanceof Error) {
        console.error("Error message:", error.message)
        console.error("Error stack:", error.stack)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (!dashboardData) {
    return (
      <div className="w-full py-4 sm:py-6 px-3 sm:px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Unable to load dashboard</h2>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    )
  }

  const xpBreakdownData = dashboardData.stats.xp.breakdown.map((item) => ({
    name: item._id.replace("_", " ").toUpperCase(),
    value: item.totalXP,
    count: item.count,
  }))

  const activityChartData = dashboardData.charts.dailyActivity.map((item) => ({
    date: new Date(item._id).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    xp: item.totalXP,
    activities: item.totalActivities,
  }))

  return (
    <div className="w-full py-4 sm:py-6 px-1 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Welcome back, {user?.displayName}! Here's your activity overview.</p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchDashboardData} variant="outline" size="sm" className="flex-shrink-0">
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-[10px] sm:text-sm font-medium">Total XP</CardTitle>
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
          </CardHeader>
          <CardContent className="pt-1 sm:pt-2">
            <div className="text-sm sm:text-xl font-bold">{dashboardData.user.points > 999 ? `${(dashboardData.user.points / 1000).toFixed(1)}k` : dashboardData.user.points}</div>
            <p className="text-[8px] sm:text-xs text-muted-foreground">
              L{dashboardData.user.level} • #{dashboardData.user.rank}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-[10px] sm:text-sm font-medium">Posts</CardTitle>
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-1 sm:pt-2">
            <div className="text-sm sm:text-xl font-bold">{dashboardData.stats.posts.totalPosts}</div>
            <p className="text-[8px] sm:text-xs text-muted-foreground">
              {dashboardData.stats.posts.avgLikes.toFixed(1)} avg likes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-[10px] sm:text-sm font-medium">Engagement</CardTitle>
            <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
          </CardHeader>
          <CardContent className="pt-1 sm:pt-2">
            <div className="text-sm sm:text-xl font-bold">
              {(dashboardData.stats.posts.totalLikes + dashboardData.stats.posts.totalComments) > 999 
                ? `${((dashboardData.stats.posts.totalLikes + dashboardData.stats.posts.totalComments) / 1000).toFixed(1)}k`
                : (dashboardData.stats.posts.totalLikes + dashboardData.stats.posts.totalComments)
              }
            </div>
            <p className="text-[8px] sm:text-xs text-muted-foreground">
              {dashboardData.stats.posts.totalLikes}♥ {dashboardData.stats.posts.totalComments}💬
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-[10px] sm:text-sm font-medium">Badges</CardTitle>
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
          </CardHeader>
          <CardContent className="pt-1 sm:pt-2">
            <div className="text-sm sm:text-xl font-bold">{dashboardData.user.badges.length}</div>
            <p className="text-[8px] sm:text-xs text-muted-foreground">{dashboardData.achievements.length} recent</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Daily Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={activityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="xp" stroke="#10B981" strokeWidth={2} name="XP Earned" />
                <Line type="monotone" dataKey="activities" stroke="#3B82F6" strokeWidth={2} name="Activities" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* XP Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              XP Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={xpBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {xpBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} XP`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {xpBreakdownData.map((entry, index) => (
                <div key={entry.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs sm:text-sm text-gray-600">
                    {entry.name}: {entry.value} XP
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed views */}
      <Tabs defaultValue="achievements" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="achievements" className="text-xs sm:text-sm px-2 py-1">Achievements</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm px-2 py-1">Activity</TabsTrigger>
          <TabsTrigger value="goals" className="text-xs sm:text-sm px-2 py-1">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.achievements.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {dashboardData.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="bg-yellow-100 p-2 rounded-full flex-shrink-0">
                        <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base truncate">{achievement.type.replace("_", " ").toUpperCase()}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{achievement.description}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">{new Date(achievement.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">+{achievement.metadata?.xpEarned || 0} XP</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent achievements</h3>
                  <p className="text-gray-600">Keep posting and engaging to unlock new badges!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{dashboardData.stats.posts.totalPosts}</div>
                  <div className="text-sm text-gray-600">Posts Created</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{dashboardData.stats.posts.totalLikes}</div>
                  <div className="text-sm text-gray-600">Likes Received</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {dashboardData.stats.posts.totalComments}
                  </div>
                  <div className="text-sm text-gray-600">Comments Received</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Goals & Missions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Weekly Post Goal</h4>
                    <Badge variant="outline">{dashboardData.stats.posts.totalPosts}/5 posts</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((dashboardData.stats.posts.totalPosts / 5) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Create 5 posts this week to earn bonus XP</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Engagement Master</h4>
                    <Badge variant="outline">{dashboardData.stats.posts.totalLikes}/50 likes</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((dashboardData.stats.posts.totalLikes / 50) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Receive 50 likes to unlock the Engagement Master badge</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
