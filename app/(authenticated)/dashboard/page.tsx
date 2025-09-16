"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

import { ActivityChart, XPChart } from '@/components/simple-charts'
import { Activity, MessageSquare, Heart, Trophy, Target, Zap, Wallet } from "lucide-react"
import { TransactionHistory } from '@/components/transactions/transaction-history'
import { WalletBalanceDisplay } from '@/components/transactions/wallet-balance-display'
import { TransferForm } from '@/components/transactions/transfer-form'
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
      lifetimePosts?: number
      lifetimeLikes?: number
      lifetimeComments?: number
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



export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("week")
  const { user } = useAuth()

  useEffect(() => {
    if (dashboardData) {
      // Don't show loading skeleton when switching periods if we already have data
      fetchDashboardData(false)
    } else {
      fetchDashboardData(true)
    }
  }, [period])

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
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
      if (showLoading) setLoading(false)
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (!dashboardData) {
    return (
      <div className="w-full py-4 sm:py-6 px-3 sm:px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Unable to load dashboard</h2>
          <Button onClick={() => fetchDashboardData(true)}>Try Again</Button>
        </div>
      </div>
    )
  }

  const xpBreakdownData = dashboardData?.stats?.xp?.breakdown?.map((item) => ({
    name: item._id?.replace(/_/g, " ").toUpperCase() || 'Unknown',
    value: item.totalXP || 0,
    count: item.count || 0,
  })) || []

  const activityChartData = dashboardData?.charts?.dailyActivity?.map((item) => ({
    date: item._id ? new Date(item._id).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : 'Unknown',
    xp: item.totalXP || 0,
    activities: item.totalActivities || 0,
  })) || []

  console.log("Chart data:", { xpBreakdownData, activityChartData })
  console.log("Activity chart data length:", activityChartData?.length)
  console.log("XP breakdown data length:", xpBreakdownData?.length)
  console.log("Sample activity data:", activityChartData?.[0])
  console.log("Sample XP data:", xpBreakdownData?.[0])

  return (
    <div className="w-full py-4 sm:py-6 px-1 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Welcome back, {user?.displayName}! Here's your activity overview.</p>
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
          <Button onClick={() => fetchDashboardData(false)} variant="outline" size="sm" className="flex-shrink-0">
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
            <div className="text-sm sm:text-xl font-bold">{dashboardData.stats.posts.lifetimePosts || dashboardData.stats.posts.totalPosts}</div>
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
              {(() => {
                const lifetimeLikes = dashboardData.stats.posts.lifetimeLikes || dashboardData.stats.posts.totalLikes
                const lifetimeComments = dashboardData.stats.posts.lifetimeComments || dashboardData.stats.posts.totalComments
                const total = lifetimeLikes + lifetimeComments
                return total > 999 ? `${(total / 1000).toFixed(1)}k` : total
              })()
              }
            </div>
            <p className="text-[8px] sm:text-xs text-muted-foreground">
              {dashboardData.stats.posts.lifetimeLikes || dashboardData.stats.posts.totalLikes}♥ {dashboardData.stats.posts.lifetimeComments || dashboardData.stats.posts.totalComments}💬
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
            <div className="w-full" style={{ minHeight: '200px' }}>
              <ActivityChart data={activityChartData} />
            </div>
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
            <div className="w-full" style={{ minHeight: '200px' }}>
              <XPChart data={xpBreakdownData} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed views */}
      <Tabs defaultValue="achievements" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="achievements" className="text-xs sm:text-sm px-2 py-1">Achievements</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm px-2 py-1">Activity</TabsTrigger>
          <TabsTrigger value="goals" className="text-xs sm:text-sm px-2 py-1">Goals</TabsTrigger>
          <TabsTrigger value="wallet" className="text-xs sm:text-sm px-2 py-1">Wallet</TabsTrigger>
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
                    <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                      <div className="bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded-full flex-shrink-0">
                        <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base truncate">{achievement.type.replace("_", " ").toUpperCase()}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{achievement.description}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{new Date(achievement.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">+{achievement.metadata?.xpEarned || 0} XP</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No recent achievements</h3>
                  <p className="text-muted-foreground">Keep posting and engaging to unlock new badges!</p>
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
                  <div className="text-3xl font-bold text-blue-600 mb-2">{dashboardData.stats.posts.lifetimePosts || dashboardData.stats.posts.totalPosts}</div>
                  <div className="text-sm text-muted-foreground">Posts Created</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{dashboardData.stats.posts.lifetimeLikes || dashboardData.stats.posts.totalLikes}</div>
                  <div className="text-sm text-muted-foreground">Likes Received</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {dashboardData.stats.posts.lifetimeComments || dashboardData.stats.posts.totalComments}
                  </div>
                  <div className="text-sm text-muted-foreground">Comments Received</div>
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
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.min((dashboardData.stats.posts.totalPosts / 5) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Create 5 posts this week to earn bonus XP</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Engagement Master</h4>
                    <Badge variant="outline">{dashboardData.stats.posts.lifetimeLikes || dashboardData.stats.posts.totalLikes}/50 likes</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.min(((dashboardData.stats.posts.lifetimeLikes || dashboardData.stats.posts.totalLikes) / 50) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Receive 50 likes to unlock the Engagement Master badge</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WalletBalanceDisplay />
              <TransferForm />
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="h-5 w-5 mr-2" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionHistory />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
