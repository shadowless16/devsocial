import { AnalyticsClient } from "./analytics-client"
import { cookies } from "next/headers"
import { getUserFromToken } from "@/lib/auth/jwt-auth"

async function getAnalyticsData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/analytics/overview?days=30`, {
      cache: 'no-store',
      headers: {
        'Cookie': (await cookies()).toString()
      }
    })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

const sampleData = {
  summary: { totalUsers: 15420, activeUsers: 3240, totalPosts: 892, engagementRate: 68.5 },
  trends: {
    userGrowth: [{ date: "Jan 1", totalUsers: 1200, newUsers: 45 }, { date: "Jan 8", totalUsers: 1280, newUsers: 80 }],
    contentGrowth: [{ date: "Week 1", posts: 245, comments: 890, likes: 1200 }],
    platformMetrics: [{ date: "00:00", pageViews: 120 }, { date: "02:00", pageViews: 80 }]
  },
  topContent: { tags: [{ tag: 'javascript', count: 245 }] },
  demographics: { countries: [{ country: 'United States', percentage: 35 }] }
}

export default async function AnalyticsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const user = token ? await getUserFromToken(token) : null
  const isAdmin = user?.role === 'admin'
  
  const analyticsData = await getAnalyticsData()
  
  return <AnalyticsClient initialData={{ analyticsData, sampleData }} isAdmin={isAdmin} />
}
