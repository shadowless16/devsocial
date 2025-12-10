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
} from "recharts"
import { DateRangePicker } from "@/components/analytics/date-range-picker"
import { ExportMenu } from "@/components/analytics/export-menu"
import { RealTimeIndicator } from "@/components/analytics/real-time-indicator"
import { InteractiveChart } from "@/components/analytics/interactive-chart"
import { GenerateDataButton } from "@/components/analytics/generate-data-button"
import { AnalyticsStatus } from "@/components/analytics/analytics-status"
import { UserManagement } from "@/components/admin/user-management"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface AnalyticsSummary {
  totalUsers?: number
  activeUsers?: number
  totalPosts?: number
  engagementRate?: number
}

interface AnalyticsTrends {
  userGrowth?: Array<{ date: string; totalUsers: number; newUsers: number }>
  contentGrowth?: Array<{ date: string; posts: number; comments: number; likes: number }>
  platformMetrics?: Array<{ date: string; pageViews: number }>
}

interface TopContent {
  tags?: Array<{ tag: string; count: number }>
}

interface Demographics {
  countries?: Array<{ country: string; percentage: number }>
}

interface AnalyticsDataStructure {
  summary?: AnalyticsSummary
  trends?: AnalyticsTrends
  topContent?: TopContent
  demographics?: Demographics
}

interface AnalyticsData {
  sampleData?: AnalyticsDataStructure
  analyticsData?: AnalyticsDataStructure
}

interface AnalyticsClientProps {
  initialData: AnalyticsData
  isAdmin: boolean
}

export function AnalyticsClient({ initialData, isAdmin }: AnalyticsClientProps) {
  const router = useRouter()
  const [useSampleData, setUseSampleData] = useState(false)

  const handleRefresh = () => {
    router.refresh()
  }

  const displayData = useSampleData ? initialData.sampleData : initialData.analyticsData
  const summary = displayData?.summary || {}
  const trends = displayData?.trends || {}
  const demographics = displayData?.demographics || {}

  return (
    <div className="space-y-6">
      <AnalyticsStatus />
      {isAdmin && <UserManagement />}
      
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

      <div className="grid gap-4 md:grid-cols-2">
        <InteractiveChart
          title="User Registration Trends"
          description="New user signups over the last 30 days"
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

      <div className="grid gap-4 md:grid-cols-3">
        <InteractiveChart title="Top Content Tags" description="Most popular content tags">
          <div style={{ width: '100%', height: '250px' }}>
            {displayData?.topContent?.tags && displayData.topContent.tags.length > 0 ? (
              <PieChart width={300} height={250}>
                <Pie
                  data={(displayData.topContent.tags || []).slice(0, 5).map((tag: { tag: string; count: number }, index: number) => ({
                    name: tag.tag,
                    value: tag.count,
                    color: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#6b7280'][index]
                  }))}
                  cx={150}
                  cy={125}
                  outerRadius={80}
                  dataKey="value"
                  label={(props: { name?: string; value?: number }) => `${props.name || ''}: ${props.value || 0}`}
                >
                  {(displayData.topContent.tags || []).slice(0, 5).map((_tag: { tag: string; count: number }, idx: number) => (
                    <Cell key={`cell-${idx}`} fill={['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#6b7280'][idx]} />
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
            {demographics.countries?.slice(0, 5).map((country: { country: string; percentage: number }) => (
              <div key={country.country} className="flex items-center justify-between">
                <span className="text-sm">{country.country}</span>
                <Badge variant="secondary">{country.percentage}%</Badge>
              </div>
            )) || (
              <div className="text-center text-muted-foreground py-4">
                <p>No geographic data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
