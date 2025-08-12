"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RealTimeIndicator } from "@/components/analytics/real-time-indicator"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Activity, Users, MessageSquare, Eye, Heart, Share2, Clock, MapPin, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GenerateDataButton } from "@/components/analytics/generate-data-button"
import { ClientChart } from "@/components/analytics/client-chart"
import { useEffect, useState } from "react"

// Types
interface DeviceData {
  name: string
  value: number
  color: string
}

interface TopPage {
  page: string
  views: number
  users: number
}

interface RecentActivity {
  id: number
  user: string
  action: string
  target: string
  time: string
  avatar: string
}

interface GeographicData {
  country: string
  users: number
  percentage: number
}

interface RealtimeData {
  activeUsers?: number
  pageViews?: number
  newPosts?: number
  newComments?: number
  likes?: number
  shares?: number
  deviceDistribution?: DeviceData[]
  topPages?: TopPage[]
  recentActivity?: RecentActivity[]
  geographicData?: GeographicData[]
}

// Fetch real-time data from API
const fetchRealtimeData = async (): Promise<RealtimeData> => {
  try {
    const response = await fetch('/api/analytics/realtime')
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied. Analytics access required.')
      }
      throw new Error('Failed to fetch real-time data')
    }
    return await response.json() as RealtimeData
  } catch (error: any) {
    console.error('Error fetching realtime data:', error)
    throw error
  }
}

// Default fallback data
const defaultDeviceData: DeviceData[] = [
  { name: "Desktop", value: 45, color: "#3b82f6" },
  { name: "Mobile", value: 38, color: "#06b6d4" },
  { name: "Tablet", value: 17, color: "#10b981" },
]

const defaultTopPages: TopPage[] = [
  { page: "/feed", views: 2340, users: 1890 },
  { page: "/projects", views: 1890, users: 1456 },
  { page: "/missions", views: 1560, users: 1234 },
  { page: "/profile/john-doe", views: 890, users: 678 },
  { page: "/analytics", views: 567, users: 445 },
]

const defaultRecentActivity: RecentActivity[] = [
  {
    id: 1,
    user: "Alex Chen",
    action: "created a new project",
    target: "AI Code Assistant",
    time: "2 seconds ago",
    avatar: "/generic-user-avatar.png",
  },
  {
    id: 2,
    user: "Sarah Kim",
    action: "completed mission",
    target: "First Pull Request",
    time: "15 seconds ago",
    avatar: "/diverse-avatars.png",
  },
  {
    id: 3,
    user: "Mike Johnson",
    action: "joined project",
    target: "React Dashboard",
    time: "32 seconds ago",
    avatar: "/generic-user-avatar.png",
  },
  {
    id: 4,
    user: "Emma Wilson",
    action: "posted update",
    target: "Just shipped v2.0!",
    time: "1 minute ago",
    avatar: "/diverse-avatars.png",
  },
  {
    id: 5,
    user: "David Lee",
    action: "liked post",
    target: "Building with Next.js 14",
    time: "2 minutes ago",
    avatar: "/generic-user-avatar.png",
  },
]

const defaultGeographicData: GeographicData[] = [
  { country: "United States", users: 456, percentage: 32 },
  { country: "United Kingdom", users: 234, percentage: 16 },
  { country: "Germany", users: 189, percentage: 13 },
  { country: "Canada", users: 156, percentage: 11 },
  { country: "France", users: 123, percentage: 9 },
  { country: "Others", users: 267, percentage: 19 },
]

export default function RealtimePage() {
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Fetch real-time data
  const loadRealtimeData = async (): Promise<void> => {
    try {
      const data = await fetchRealtimeData()
      setRealtimeData(data)
      setLastUpdate(new Date())
    } catch (error: any) {
      console.error('Error loading realtime data:', error)
      setRealtimeData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial load
    loadRealtimeData()
    
    // Update every 5 seconds
    const interval = setInterval(loadRealtimeData, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading real-time analytics...</p>
        </div>
      </div>
    )
  }

  if (!realtimeData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Failed to load real-time analytics</p>
          <p className="text-sm text-muted-foreground mb-4">You may not have permission to view analytics or there was a server error.</p>
          <Button onClick={loadRealtimeData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Use API data with null checks
  const realtimeStats = realtimeData as any || {}
  const deviceData = realtimeData?.deviceDistribution || defaultDeviceData
  const topPages = (realtimeData?.topPages?.length || 0) > 0 ? (realtimeData.topPages || defaultTopPages) : defaultTopPages
  const recentActivity = realtimeData?.recentActivity || defaultRecentActivity
  const geographicData = realtimeData?.geographicData || defaultGeographicData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-time Analytics</h1>
          <p className="text-muted-foreground">Live platform activity and user behavior insights</p>
        </div>
        <div className="flex items-center gap-2">
          <GenerateDataButton />
          <RealTimeIndicator />
          <Badge variant="outline" className="text-green-600 border-green-200">
            <Activity className="h-3 w-3 mr-1" />
            Live Data
          </Badge>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(realtimeStats.activeUsers || 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Right now</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeStats.pageViews || 0}</div>
            <div className="text-xs text-muted-foreground">Last 5 minutes</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeStats.newPosts || 0}</div>
            <div className="text-xs text-muted-foreground">Last hour</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeStats.newComments || 0}</div>
            <div className="text-xs text-muted-foreground">Last hour</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeStats.likes || 0}</div>
            <div className="text-xs text-muted-foreground">Last hour</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeStats.shares || 0}</div>
            <div className="text-xs text-muted-foreground">Last hour</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Real-time Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Activity Feed
            </CardTitle>
            <CardDescription>Real-time user actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {recentActivity.map((activity: RecentActivity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.avatar || "/placeholder.svg"} alt={activity.user} />
                      <AvatarFallback>
                        {activity.user
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <span className="font-medium">{activity.user}</span>{" "}
                        <span className="text-muted-foreground">{activity.action}</span>{" "}
                        <span className="font-medium">{activity.target}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
            <CardDescription>Current active users by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <div style={{ width: '100%', height: '200px' }}>
                <PieChart width={300} height={200}>
                  <Pie
                    data={deviceData}
                    cx={150}
                    cy={100}
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deviceData.map((entry: DeviceData, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value}%`, 'Usage']} />
                </PieChart>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {deviceData.map((device: DeviceData) => (
                <div key={device.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: device.color }}
                    />
                    <span>{device.name}</span>
                  </div>
                  <span className="font-medium">{device.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages and Geographic Data */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages in the last hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPages.map((page: TopPage, index: number) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{page.page}</div>
                      <div className="text-sm text-muted-foreground">{page.users} unique users</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{page.views.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">views</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
            <CardDescription>Active users by country</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {geographicData.map((country: GeographicData) => (
                <div key={country.country} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{country.country}</span>
                    <span className="text-muted-foreground">
                      {country.users} users ({country.percentage}%)
                    </span>
                  </div>
                  <Progress value={country.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Update Info */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  )
}
