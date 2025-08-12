"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Download, TrendingUp, TrendingDown, Users, UserPlus, UserMinus, Calendar } from "lucide-react"
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
  ComposedChart,
} from "recharts"
import { ClientChart } from "@/components/analytics/client-chart"
import { useEffect, useState } from "react"

// Default fallback data
const defaultRegistrationSources = [
  { source: "Organic Search", users: 0, percentage: 35, color: "#22c55e" },
  { source: "Social Media", users: 0, percentage: 25, color: "#3b82f6" },
  { source: "Direct", users: 0, percentage: 20, color: "#f59e0b" },
  { source: "Referrals", users: 0, percentage: 15, color: "#8b5cf6" },
  { source: "Email", users: 0, percentage: 5, color: "#ef4444" },
]

export default function UserAnalyticsPage() {
  const [userAnalytics, setUserAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  // Fetch user analytics data
  const fetchUserAnalytics = async (days = 30) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/users?days=${days}`)
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Analytics access required.')
        }
        throw new Error('Failed to fetch user analytics')
      }
      const data = await response.json()
      setUserAnalytics(data)
    } catch (error) {
      console.error('Error fetching user analytics:', error)
      setUserAnalytics(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30
    fetchUserAnalytics(days)
  }, [timeRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user analytics...</p>
        </div>
      </div>
    )
  }

  if (!userAnalytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Failed to load user analytics</p>
          <p className="text-sm text-muted-foreground mb-4">You may not have permission to view analytics or there was a server error.</p>
          <Button onClick={() => fetchUserAnalytics()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const summary = userAnalytics.summary || {}
  const trends = userAnalytics.trends || []
  const demographics = userAnalytics.demographics || { countries: [] }
  const retention = userAnalytics.retention || []
  
  // Process registration sources from API data
  const registrationSources = demographics.acquisitionChannels?.map((channel: any, index: number) => ({
    source: channel.channel,
    users: channel.users,
    percentage: channel.percentage,
    color: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'][index] || '#6b7280'
  })) || [
    { source: "Organic Search", users: 245, percentage: 35, color: "#22c55e" },
    { source: "Social Media", users: 189, percentage: 25, color: "#3b82f6" },
    { source: "Direct", users: 156, percentage: 20, color: "#f59e0b" },
    { source: "Referrals", users: 98, percentage: 15, color: "#8b5cf6" },
    { source: "Email", users: 45, percentage: 5, color: "#ef4444" }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Analytics</h1>
          <p className="text-muted-foreground">Deep dive into user behavior and demographics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30d">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key User Metrics */}
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
              <span className="text-emerald-600">+18.2%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users (30d)</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.newUsersToday?.toLocaleString() || '0'}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600">+12.5%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <UserMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.1%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600">-2.5%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12m 34s</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600">+5.8%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Trends */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth Trends</CardTitle>
          <CardDescription>Daily, weekly, and monthly user acquisition patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" className="space-y-4">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="cumulative">Cumulative</TabsTrigger>
            </TabsList>
            <TabsContent value="daily">
              <div style={{ width: '100%', height: '350px' }}>
                <LineChart width={800} height={350} data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="newUsers" stroke="#22c55e" strokeWidth={2} name="New Users" />
                </LineChart>
              </div>
            </TabsContent>
            <TabsContent value="weekly">
              <div style={{ width: '100%', height: '350px' }}>
                <BarChart width={800} height={350} data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="weeklyActiveUsers" fill="#22c55e" name="Weekly Active Users" />
                </BarChart>
              </div>
            </TabsContent>
            <TabsContent value="monthly">
              <div style={{ width: '100%', height: '350px' }}>
                <AreaChart width={800} height={350} data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="monthlyActiveUsers" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Monthly Active Users" />
                </AreaChart>
              </div>
            </TabsContent>
            <TabsContent value="cumulative">
              <div style={{ width: '100%', height: '350px' }}>
                <LineChart width={800} height={350} data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="totalUsers" stroke="#22c55e" strokeWidth={3} name="Total Users" />
                </LineChart>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Cohort Analysis and Registration Sources */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Retention Analysis</CardTitle>
            <CardDescription>Average retention rates over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {summary.avgRetention?.day1 || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Day 1 Retention</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {summary.avgRetention?.day7 || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Day 7 Retention</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {summary.avgRetention?.day30 || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Day 30 Retention</div>
                </div>
              </div>
              {retention.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Retention Trends</h4>
                  <div className="space-y-2">
                    {retention.slice(-5).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{item.date}</span>
                        <div className="flex gap-4">
                          <span>D1: {item.day1}%</span>
                          <span>D7: {item.day7}%</span>
                          <span>D30: {item.day30}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration Sources</CardTitle>
            <CardDescription>Where new users are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div style={{ width: '100%', height: '200px' }}>
              <PieChart width={300} height={200}>
                <Pie
                  data={registrationSources}
                  cx={150}
                  cy={100}
                  outerRadius={80}
                  dataKey="users"
                  label={({ source, percentage }) => `${source}: ${percentage}%`}
                >
                  {registrationSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
              <div className="space-y-2">
                {registrationSources.map((source) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded" style={{ backgroundColor: source.color }} />
                      <span className="text-sm">{source.source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{source.users.toLocaleString()}</span>
                      <Badge variant="secondary">{source.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Summary */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth Summary</CardTitle>
          <CardDescription>Key user metrics and growth indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Users</span>
                <span className="text-lg font-bold">{summary.totalUsers?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">New Users (30d)</span>
                <span className="text-lg font-bold text-emerald-600">{summary.newUsersToday?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Daily Active</span>
                <span className="text-lg font-bold">{summary.activeUsersToday?.toLocaleString() || '0'}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Weekly Active</span>
                <span className="text-lg font-bold">{summary.weeklyActiveUsers?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Monthly Active</span>
                <span className="text-lg font-bold">{summary.monthlyActiveUsers?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Avg Retention</span>
                <span className="text-lg font-bold text-emerald-600">{summary.avgRetention?.day30 || 0}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demographics and Churn Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>User distribution by country</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demographics.countries?.length > 0 ? demographics.countries.slice(0, 5).map((country: any) => (
                <div key={country.country} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{country.country}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{country.count?.toLocaleString() || '0'}</span>
                      <Badge variant="secondary">{country.percentage}%</Badge>
                    </div>
                  </div>
                  <Progress value={country.percentage} className="[&>div]:bg-emerald-600" />
                </div>
              )) : (
                <div className="text-center text-muted-foreground py-4">
                  <p>No geographic data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth Trends</CardTitle>
            <CardDescription>New user acquisition over time</CardDescription>
          </CardHeader>
          <CardContent>
            {trends.length > 0 ? (
              <div style={{ width: '100%', height: '250px' }}>
                <ComposedChart width={400} height={250} data={trends.slice(-6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="newUsers" fill="#22c55e" name="New Users" />
                  <Bar yAxisId="left" dataKey="activeUsers" fill="#3b82f6" name="Active Users" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="growth"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Growth %"
                  />
                </ComposedChart>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <p>No growth data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
