"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, MessageSquare, Activity, Globe, RefreshCw, Database, TestTube } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { DateRangePicker } from "@/components/analytics/date-range-picker"
import { ExportMenu } from "@/components/analytics/export-menu"
import { RealTimeIndicator } from "@/components/analytics/real-time-indicator"
import { InteractiveChart } from "@/components/analytics/interactive-chart"
import { GenerateDataButton } from "@/components/analytics/generate-data-button"
import { AnalyticsStatus } from "@/components/analytics/analytics-status"
import { ClientChart } from "@/components/analytics/client-chart"
import { useEffect, useState } from "react"

// Mock data for charts
const userGrowthData = [
  { date: "Jan 1", users: 1200, newUsers: 45 },
  { date: "Jan 8", users: 1280, newUsers: 80 },
  { date: "Jan 15", users: 1420, newUsers: 140 },
  { date: "Jan 22", users: 1580, newUsers: 160 },
  { date: "Jan 29", users: 1750, newUsers: 170 },
  { date: "Feb 5", users: 1920, newUsers: 170 },
  { date: "Feb 12", users: 2100, newUsers: 180 },
]

const contentVolumeData = [
  { week: "Week 1", posts: 245, comments: 890, likes: 1200 },
  { week: "Week 2", posts: 280, comments: 950, likes: 1350 },
  { week: "Week 3", posts: 320, comments: 1100, likes: 1500 },
  { week: "Week 4", posts: 290, comments: 980, likes: 1400 },
]

const featureUsageData = [
  { name: "Posts", value: 35, color: "#22c55e" },
  { name: "Comments", value: 25, color: "#3b82f6" },
  { name: "Projects", value: 20, color: "#f59e0b" },
  { name: "Missions", value: 15, color: "#8b5cf6" },
  { name: "Other", value: 5, color: "#6b7280" },
]

const peakHoursData = [
  { hour: "00", activity: 12 },
  { hour: "02", activity: 8 },
  { hour: "04", activity: 5 },
  { hour: "06", activity: 15 },
  { hour: "08", activity: 45 },
  { hour: "10", activity: 65 },
  { hour: "12", activity: 80 },
  { hour: "14", activity: 75 },
  { hour: "16", activity: 85 },
  { hour: "18", activity: 90 },
  { hour: "20", activity: 70 },
  { hour: "22", activity: 40 },
]

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [useSampleData, setUseSampleData] = useState(false)

  // Fetch analytics overview data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics/overview?days=30')
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Analytics access required.')
        }
        throw new Error('Failed to fetch analytics')
      }
      const data = await response.json()
      setAnalyticsData(data)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Show error to user instead of fallback data
      setAnalyticsData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const handleRefresh = () => {
    fetchAnalyticsData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics dashboard...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Failed to load analytics data</p>
          <p className="text-sm text-muted-foreground mb-4">You may not have permission to view analytics or there was a server error.</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Sample data for demo
  const sampleAnalyticsData = {
    summary: {
      totalUsers: 15420,
      activeUsers: 3240,
      totalPosts: 892,
      engagementRate: 68.5
    },
    trends: {
      userGrowth: userGrowthData,
      contentGrowth: contentVolumeData,
      platformMetrics: peakHoursData
    },
    topContent: {
      tags: [
        { tag: 'javascript', count: 245 },
        { tag: 'react', count: 189 },
        { tag: 'nodejs', count: 156 },
        { tag: 'python', count: 134 },
        { tag: 'typescript', count: 98 }
      ]
    },
    demographics: {
      countries: [
        { country: 'United States', percentage: 35 },
        { country: 'India', percentage: 22 },
        { country: 'United Kingdom', percentage: 12 },
        { country: 'Canada', percentage: 8 },
        { country: 'Germany', percentage: 6 }
      ]
    }
  }

  const displayData = useSampleData ? sampleAnalyticsData : analyticsData
  const summary = displayData?.summary || {}
  const trends = displayData?.trends || {}
  const demographics = displayData?.demographics || {}

  return (
    <div className="space-y-6">
      {/* Analytics Status */}
      <AnalyticsStatus />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <RealTimeIndicator />
          </div>
          <p className="text-muted-foreground">Platform insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 mr-4">
            <Database className="h-4 w-4" />
            <Label htmlFor="analytics-data-toggle">Database</Label>
            <Switch
              id="analytics-data-toggle"
              checked={useSampleData}
              onCheckedChange={setUseSampleData}
            />
            <Label htmlFor="analytics-data-toggle">Demo</Label>
            <TestTube className="h-4 w-4" />
          </div>
          <GenerateDataButton />
          <DateRangePicker />
          <Button variant="outline" size="icon" className="bg-transparent" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <ExportMenu filename="analytics-dashboard" />
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalUsers?.toLocaleString() || '0'}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600">+12.5%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeUsers?.toLocaleString() || '0'}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600">+8.2%</span>
              <span>from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Created Today</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalPosts || '0'}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600">+15.3%</span>
              <span>from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.engagementRate || '0'}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600">+3.1%</span>
              <span>from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <InteractiveChart
          title="User Registration Trends"
          description="New user signups over the last 30 days"
          data={trends.userGrowth || []}
        >
          <div style={{ width: '100%', height: '300px' }}>
            <LineChart width={600} height={300} data={trends.userGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalUsers" stroke="#22c55e" strokeWidth={2} name="Total Users" />
              <Line type="monotone" dataKey="newUsers" stroke="#3b82f6" strokeWidth={2} name="New Users" />
            </LineChart>
          </div>
        </InteractiveChart>

        <InteractiveChart
          title="Content Creation Volume"
          description="Daily content activity breakdown"
          data={trends.contentGrowth || []}
        >
          <div style={{ width: '100%', height: '300px' }}>
            <BarChart width={600} height={300} data={trends.contentGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="posts" fill="#22c55e" name="Posts" />
              <Bar dataKey="comments" fill="#3b82f6" name="Comments" />
              <Bar dataKey="likes" fill="#f59e0b" name="Likes" />
            </BarChart>
          </div>
        </InteractiveChart>
      </div>

      {/* Engagement Analytics */}
      <div className="grid gap-4 md:grid-cols-3">
        <InteractiveChart title="Top Content Tags" description="Most popular content tags" data={analyticsData.topContent?.tags || []}>
          <div style={{ width: '100%', height: '250px' }}>
            {displayData?.topContent?.tags && displayData.topContent.tags.length > 0 ? (
              <PieChart width={300} height={250}>
                <Pie
                  data={(displayData.topContent.tags || []).slice(0, 5).map((tag, index) => ({
                    name: tag.tag,
                    value: tag.count,
                    color: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#6b7280'][index]
                  }))}
                  cx={150}
                  cy={125}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {(displayData.topContent.tags || []).slice(0, 5).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#6b7280'][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No tag data available
              </div>
            )}
          </div>
        </InteractiveChart>

        <InteractiveChart
          title="Peak Usage Hours"
          description="Activity levels throughout the day"
          data={trends.platformMetrics || []}
        >
          <div style={{ width: '100%', height: '250px' }}>
            <AreaChart width={400} height={250} data={trends.platformMetrics?.slice(-7) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="pageViews" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Page Views" />
            </AreaChart>
          </div>
        </InteractiveChart>

        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Top user locations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {demographics.countries?.slice(0, 5).map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <span className="text-sm">{country.country}</span>
                <Badge variant="secondary">{country.percentage}%</Badge>
              </div>
            )) || (
              <div className="text-center text-muted-foreground py-4">
                <p>No geographic data available</p>
              </div>
            )}
            {demographics.countries?.length > 5 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Others</span>
                <Badge variant="outline">
                  {100 - demographics.countries.slice(0, 5).reduce((sum, c) => sum + c.percentage, 0)}%
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
