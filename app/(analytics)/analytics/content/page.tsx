"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
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
import { FileText, MessageSquare, Heart, Share2, Eye, Flag, TrendingUp, Hash, Clock, AlertTriangle, RefreshCw } from "lucide-react"
import { ClientChart } from "@/components/analytics/client-chart"
import { useEffect, useState } from "react"

// Types
interface EngagementDistribution {
  name: string
  value: number
  color: string
}

interface ContentAnalytics {
  summary?: {
    totalPosts?: number
    totalComments?: number
    avgEngagementRate?: string
    totalEngagements?: number
  }
  trends?: any[]
  topTags?: any[]
  viralContent?: any[]
  engagementDistribution?: EngagementDistribution[]
  moderationData?: any[]
}

interface ModerationItem {
  category: string
  count: number
  resolved: number
  pending: number
}

// Default fallback data
const defaultEngagementDistribution: EngagementDistribution[] = [
  { name: "High Engagement", value: 35, color: "#22c55e" },
  { name: "Medium Engagement", value: 45, color: "#3b82f6" },
  { name: "Low Engagement", value: 20, color: "#f59e0b" },
]

export default function ContentAnalyticsPage() {
  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalytics | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Fetch content analytics data
  const fetchContentAnalytics = async (days: number = 30): Promise<void> => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/content?days=${days}`)
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Analytics access required.')
        }
        throw new Error('Failed to fetch content analytics')
      }
      const data = await response.json() as ContentAnalytics
      setContentAnalytics(data)
    } catch (error: any) {
      console.error('Error fetching content analytics:', error)
      setContentAnalytics(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContentAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading content analytics...</p>
        </div>
      </div>
    )
  }

  if (!contentAnalytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Failed to load content analytics</p>
          <p className="text-sm text-muted-foreground mb-4">You may not have permission to view analytics or there was a server error.</p>
          <Button onClick={() => fetchContentAnalytics()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const summary = contentAnalytics?.summary || {}
  const trends = contentAnalytics?.trends || []
  const topTags = contentAnalytics?.topTags || []
  const viralContent = contentAnalytics?.viralContent || []
  const engagementDistribution = contentAnalytics?.engagementDistribution || defaultEngagementDistribution
  const moderationData: ModerationItem[] = contentAnalytics?.moderationData || [
    { category: "Spam", count: 45, resolved: 42, pending: 3 },
    { category: "Inappropriate Content", count: 23, resolved: 20, pending: 3 },
    { category: "Harassment", count: 12, resolved: 11, pending: 1 },
    { category: "Copyright", count: 8, resolved: 7, pending: 1 },
    { category: "Misinformation", count: 5, resolved: 4, pending: 1 }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Analytics</h1>
          <p className="text-muted-foreground">Deep insights into posts, engagement, and content performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            Last 30 days
          </Button>
        </div>
      </div>

      {/* Key Content Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalPosts?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalComments?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-600">+18.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement Rate</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgEngagementRate || '0'}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-600">+0.8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Moderated</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalEngagements?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-15.3%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Creation Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Content Creation Trends</CardTitle>
          <CardDescription>Posts, comments, and likes over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: '300px' }}>
            <AreaChart width={800} height={300} data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="newPosts" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Posts" />
              <Area type="monotone" dataKey="newComments" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Comments" />
              <Area type="monotone" dataKey="newLikes" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Likes" />
            </AreaChart>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Popular Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Popular Tags & Topics
            </CardTitle>
            <CardDescription>Most used tags and their engagement rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTags.length > 0 ? topTags.slice(0, 6).map((tag: any, index: number) => (
                <div key={tag._id || tag.tag || index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-700">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">#{tag._id || tag.tag || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{tag.count || 0} posts</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{Math.round((tag.growth || 0) * 100) / 100}%</div>
                    <div className="text-sm text-muted-foreground">growth</div>
                  </div>
                </div>
              )) : (
                <div className="text-center text-muted-foreground py-8">
                  <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No trending tags yet</p>
                  <p className="text-sm">Popular hashtags will appear here as users post content</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Engagement Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Distribution</CardTitle>
            <CardDescription>How posts perform across engagement levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div style={{ width: '100%', height: '200px' }}>
                <PieChart width={300} height={200}>
                  <Pie
                    data={engagementDistribution as any}
                    cx={150}
                    cy={100}
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {engagementDistribution.map((entry: EngagementDistribution, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value}%`, 'Posts']} />
                </PieChart>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {engagementDistribution.map((item: EngagementDistribution) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="text-muted-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Viral Content Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Viral Content Analysis
          </CardTitle>
          <CardDescription>Top performing posts with highest engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {viralContent.length > 0 ? viralContent.map((post: any) => (
              <div 
                key={post._id} 
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => window.open(`/post/${post._id}`, '_blank')}
              >
                <div className="flex-1">
                  <h4 className="font-medium hover:text-primary transition-colors">
                    {(post.content?.substring(0, 80) + (post.content?.length > 80 ? '...' : '')) || 'Post Content'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    by @{typeof post.author === 'object' ? (post.author as any)?.username || 'Unknown' : 'Unknown'} • {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {(post.viewsCount || post.views || 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {(post.likesCount || 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {(post.commentsCount || 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      {(post.sharesCount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
                    {Math.round((post.viralScore || 0) * 10) / 10}/10 Viral
                  </Badge>
                </div>
              </div>
            )) : (
              <div className="text-center text-muted-foreground py-8">
                <p>No viral content data available</p>
                <p className="text-sm">Posts with high engagement will appear here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Moderation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Content Moderation Statistics
          </CardTitle>
          <CardDescription>Flagged content and moderation activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {moderationData.map((item: ModerationItem) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="font-medium">{item.category}</div>
                  <Badge variant="outline">{item.count} total</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {item.resolved} resolved, {item.pending} pending
                  </div>
                  <Progress value={(item.resolved / item.count) * 100} className="w-20 [&>div]:bg-emerald-600" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
