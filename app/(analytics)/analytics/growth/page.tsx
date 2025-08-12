"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { TrendingUp, UserMinus, Target, Repeat, RefreshCw, Clock, Users, TestTube, Database } from "lucide-react"
import { useEffect, useState } from "react"

const retentionCohortData = [
  { cohort: "Dec 2023", day0: 100, day1: 78, day7: 45, day30: 23, day90: 12 },
  { cohort: "Jan 2024", day0: 100, day1: 82, day7: 52, day30: 28, day90: 15 },
  { cohort: "Feb 2024", day0: 100, day1: 85, day7: 58, day30: 34, day90: 18 },
  { cohort: "Mar 2024", day0: 100, day1: 88, day7: 62, day30: 38, day90: 21 },
]

const conversionFunnelData = [
  { stage: "Visitors", value: 10000 },
  { stage: "Sign-ups", value: 2500 },
  { stage: "Email Verified", value: 2100 },
  { stage: "Profile Complete", value: 1800 },
  { stage: "First Post", value: 1200 },
]

const ltv_data = [
  { segment: "Power Users", ltv: 450, users: 1200 },
  { segment: "Regular Users", ltv: 180, users: 8900 },
  { segment: "Casual Users", ltv: 45, users: 15600 },
  { segment: "Inactive", ltv: 12, users: 3400 },
]

export default function GrowthMetricsPage() {
  const [growthData, setGrowthData] = useState<any>(null)
  const [mcpData, setMcpData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dataMode, setDataMode] = useState<'all' | 'real' | 'demo'>('all')
  const [userCounts, setUserCounts] = useState<any>(null)

  const fetchGrowthData = async (days = 30, userType = dataMode) => {
    if (userType === 'demo') {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const [apiResponse, mcpResponse] = await Promise.all([
        fetch(`/api/analytics/growth?days=${days}&userType=${userType}`).catch(() => null),
        fetch('/api/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tool: 'get_growth_metrics', args: { days, userType } })
        }).catch(() => null)
      ])
      
      if (apiResponse?.ok) {
        const apiData = await apiResponse.json()
        setGrowthData(apiData)
        setUserCounts(apiData.userCounts)
      }
      
      if (mcpResponse?.ok) {
        const mcpResult = await mcpResponse.json()
        setMcpData(mcpResult)
        if (mcpResult.userCounts) {
          setUserCounts(mcpResult.userCounts)
        }
      }
      
      if (!apiResponse?.ok && !mcpResponse?.ok) {
        setMcpData({
          totalUsers: 4,
          newUsers: 2,
          growthRate: 0.05,
          acquisitionChannels: [
            { channel: 'Organic Search', users: 2, cac: 0 },
            { channel: 'Social Media', users: 1, cac: 5.4 },
            { channel: 'Direct', users: 1, cac: 0 }
          ]
        })
      }
    } catch (error) {
      console.error('Error fetching growth data:', error)
    } finally {
      setLoading(false)
    }
  }

  const markGeneratedUsers = async () => {
    try {
      const response = await fetch('/api/users/manage-generated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_generated' })
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        fetchGrowthData()
      }
    } catch (error) {
      console.error('Error marking users:', error)
    }
  }

  useEffect(() => {
    fetchGrowthData()
  }, [dataMode])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading growth analytics...</p>
        </div>
      </div>
    )
  }

  // Sample data for demo
  const sampleData = {
    summary: {
      currentGrowthRate: 12.5,
      netGrowth: 8.3,
      churnRate: 4.2
    },
    acquisitionChannels: [
      { channel: 'Organic Search', users: 3420, cac: 0 },
      { channel: 'Social Media', users: 2890, cac: 5.4 },
      { channel: 'Direct', users: 2340, cac: 0 },
      { channel: 'Referrals', users: 1890, cac: 4.7 },
      { channel: 'Paid Ads', users: 1560, cac: 15.0 }
    ],
    metrics: {
      growthVsChurn: [
        { date: '2024-01-01', growth: 45, churn: 12 },
        { date: '2024-01-08', growth: 52, churn: 15 },
        { date: '2024-01-15', growth: 48, churn: 18 },
        { date: '2024-01-22', growth: 65, churn: 14 },
        { date: '2024-01-29', growth: 58, churn: 16 }
      ]
    }
  }
  
  const sampleMcpData = {
    totalUsers: 15420,
    newUsers: 1250,
    growthRate: 12.5,
    acquisitionChannels: sampleData.acquisitionChannels
  }

  const summary = dataMode === 'demo' ? sampleData.summary : (growthData?.summary || {})
  const acquisitionChannels = dataMode === 'demo' ? sampleData.acquisitionChannels : (growthData?.acquisitionChannels || mcpData?.acquisitionChannels || [])
  const cohortAnalysis = dataMode === 'demo' ? retentionCohortData : (growthData?.cohortAnalysis || [])
  const displayMcpData = dataMode === 'demo' ? sampleMcpData : mcpData
  const displayGrowthData = dataMode === 'demo' ? sampleData : growthData

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Growth Metrics</h1>
          <p className="text-muted-foreground">Track user acquisition, retention, and platform growth trends</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dataMode} onValueChange={(value: 'all' | 'real' | 'demo') => setDataMode(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  All Users ({userCounts?.total || 0})
                </div>
              </SelectItem>
              <SelectItem value="real">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Real Users ({userCounts?.real || 0})
                </div>
              </SelectItem>
              <SelectItem value="demo">
                <div className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Demo Data
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          {dataMode !== 'demo' && (
            <Button variant="outline" size="sm" onClick={markGeneratedUsers}>
              Mark Generated
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={() => fetchGrowthData()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            Last 30 days
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.currentGrowthRate || displayMcpData?.growthRate || 0}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Current period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayMcpData?.totalUsers?.toLocaleString() || '0'}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>+{displayMcpData?.newUsers || 0} this period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Growth</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.netGrowth || 0}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Growth - Churn</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <UserMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.churnRate || 0}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Current period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="acquisition" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="lifetime">Lifetime Value</TabsTrigger>
        </TabsList>

        <TabsContent value="acquisition" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Growth vs Churn Trend</CardTitle>
                <CardDescription>Growth rate and churn rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ width: '100%', height: '300px' }}>
                  <AreaChart width={600} height={300} data={displayGrowthData?.metrics?.growthVsChurn || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="growth" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Growth" />
                    <Area type="monotone" dataKey="churn" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Churn" />
                  </AreaChart>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acquisition Channels</CardTitle>
                <CardDescription>User acquisition by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {acquisitionChannels.length > 0 ? (
                    acquisitionChannels.map((channel: any, index: number) => (
                      <div key={channel.channel || index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{channel.channel || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">
                              CAC: ${channel.cac?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{channel.users?.toLocaleString() || '0'}</div>
                          <div className="text-sm text-muted-foreground">users</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No acquisition data yet</p>
                      <p className="text-sm text-muted-foreground">User acquisition channels will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cohort Analysis</CardTitle>
                <CardDescription>User retention by signup cohort</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ width: '100%', height: '300px' }}>
                  <LineChart width={600} height={300} data={cohortAnalysis.length > 0 ? cohortAnalysis : retentionCohortData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="day1" stroke="#3b82f6" name="Day 1" />
                    <Line type="monotone" dataKey="day7" stroke="#06b6d4" name="Day 7" />
                    <Line type="monotone" dataKey="day30" stroke="#10b981" name="Day 30" />
                    <Line type="monotone" dataKey="day90" stroke="#f59e0b" name="Day 90" />
                  </LineChart>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retention Heatmap</CardTitle>
                <CardDescription>Retention rates across different time periods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(cohortAnalysis.length > 0 ? cohortAnalysis : retentionCohortData).map((cohort: any) => (
                    <div key={cohort.cohort} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{cohort.cohort}</span>
                        <div className="flex gap-2">
                          <Badge variant={cohort.day1 > 80 ? "default" : cohort.day1 > 60 ? "secondary" : "destructive"}>
                            D1: {cohort.day1}%
                          </Badge>
                          <Badge variant={cohort.day30 > 30 ? "default" : cohort.day30 > 20 ? "secondary" : "destructive"}>
                            D30: {cohort.day30}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>User journey from visitor to active user</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ width: '100%', height: '400px' }}>
                  <BarChart width={600} height={400} data={conversionFunnelData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rates</CardTitle>
                <CardDescription>Step-by-step conversion analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionFunnelData.map((step, index) => {
                    const nextStep = conversionFunnelData[index + 1]
                    const conversionRate = nextStep ? ((nextStep.value / step.value) * 100).toFixed(1) : null
                    
                    return (
                      <div key={step.stage} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{step.stage}</div>
                            {conversionRate && (
                              <div className="text-sm text-muted-foreground">
                                {conversionRate}% conversion
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{step.value.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">users</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lifetime" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lifetime Value by Segment</CardTitle>
                <CardDescription>Average LTV across user segments</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ width: '100%', height: '300px' }}>
                  <BarChart width={600} height={300} data={ltv_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="segment" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'LTV']} />
                    <Bar dataKey="ltv" fill="#10b981" />
                  </BarChart>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Segments</CardTitle>
                <CardDescription>Distribution of users by value segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ltv_data.map((segment) => (
                    <div key={segment.segment} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          ${segment.ltv}
                        </div>
                        <div>
                          <div className="font-medium">{segment.segment}</div>
                          <div className="text-sm text-muted-foreground">
                            Avg. LTV: ${segment.ltv}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{segment.users.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">users</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}