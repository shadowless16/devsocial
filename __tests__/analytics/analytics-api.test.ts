import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/jwt-auth'

// Mock API route handlers
const GET = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))
const getUserAnalytics = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))
const getContentAnalytics = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))
const getRealTimeAnalytics = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))
const generateAnalytics = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

jest.mock('@/lib/analytics-service', () => ({
  AnalyticsService: {
    getAnalyticsOverview: jest.fn(),
    getRealTimeAnalytics: jest.fn(),
    generateDailySnapshot: jest.fn()
  }
}))

jest.mock('@/models/Analytics', () => ({
  UserAnalytics: {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([])
      })
    })
  },
  ContentAnalytics: {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([])
      })
    })
  },
  GrowthAnalytics: {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([])
      })
    })
  }
}))

jest.mock('@/lib/db', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined)
}))

describe('Analytics API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('/api/analytics/overview', () => {
    it('should return analytics overview for authenticated analytics user', async () => {
      const mockSession = {
        user: { id: '1', role: 'analytics', email: 'analytics@test.com' }
      }
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const mockAnalyticsData = {
        userAnalytics: [{ totalUsers: 1000, newUsers: 50 }],
        contentAnalytics: [{ totalPosts: 5000, newPosts: 100 }],
        platformAnalytics: [{ pageViews: 10000 }],
        gamificationAnalytics: [{ totalXP: 50000 }],
        growthAnalytics: [{ growthRate: { daily: 5.2 } }]
      }

      const { AnalyticsService } = require('@/lib/analytics-service')
      AnalyticsService.getAnalyticsOverview.mockResolvedValue(mockAnalyticsData)

      const request = new NextRequest('http://localhost:3000/api/analytics/overview?days=30')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('summary')
      expect(data).toHaveProperty('trends')
      expect(data).toHaveProperty('demographics')
      expect(data.summary).toHaveProperty('totalUsers')
      expect(AnalyticsService.getAnalyticsOverview).toHaveBeenCalledWith(30)
    })

    it('should return 401 for unauthenticated users', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/analytics/overview')
      const response = await GET(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 for users without analytics access', async () => {
      const mockSession = {
        user: { id: '1', role: 'user', email: 'user@test.com' }
      }
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const request = new NextRequest('http://localhost:3000/api/analytics/overview')
      const response = await GET(request)

      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.error).toBe('Forbidden')
    })
  })

  describe('/api/analytics/users', () => {
    it('should return user analytics data', async () => {
      const mockSession = {
        user: { id: '1', role: 'analytics', email: 'analytics@test.com' }
      }
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const mockUserAnalytics = [
        {
          date: new Date('2024-01-15'),
          totalUsers: 1000,
          newUsers: 50,
          dailyActiveUsers: 300,
          userRetention: { day1: 85, day7: 65, day30: 45 }
        }
      ]

      const { UserAnalytics } = require('@/models/Analytics')
      UserAnalytics.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockUserAnalytics)
        })
      })

      const request = new NextRequest('http://localhost:3000/api/analytics/users?days=30')
      const response = await getUserAnalytics(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('summary')
      expect(data).toHaveProperty('trends')
      expect(data).toHaveProperty('retention')
      expect(data.summary.totalUsers).toBe(1000)
    })
  })

  describe('/api/analytics/content', () => {
    it('should return content analytics data', async () => {
      const mockSession = {
        user: { id: '1', role: 'admin', email: 'admin@test.com' }
      }
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const mockContentAnalytics = [
        {
          date: new Date('2024-01-15'),
          totalPosts: 5000,
          newPosts: 100,
          totalComments: 15000,
          engagementRate: 8.5,
          topTags: [
            { tag: 'javascript', count: 150 },
            { tag: 'react', count: 120 }
          ]
        }
      ]

      const { ContentAnalytics } = require('@/models/Analytics')
      ContentAnalytics.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockContentAnalytics)
        })
      })

      const request = new NextRequest('http://localhost:3000/api/analytics/content?days=30')
      const response = await getContentAnalytics(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('summary')
      expect(data).toHaveProperty('trends')
      expect(data).toHaveProperty('topTags')
      expect(data.summary.totalPosts).toBe(5000)
      expect(data.topTags).toHaveLength(2)
    })
  })

  describe('/api/analytics/realtime', () => {
    it('should return real-time analytics data', async () => {
      const mockSession = {
        user: { id: '1', role: 'analytics', email: 'analytics@test.com' }
      }
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const mockRealTimeData = {
        activeUsers: 1250,
        pageViews: 450,
        newPosts: 15,
        topPages: [{ page: '/feed', views: 1000 }],
        deviceDistribution: [{ name: 'Desktop', value: 45 }]
      }

      const { AnalyticsService } = require('@/lib/analytics-service')
      AnalyticsService.getRealTimeAnalytics.mockResolvedValue(mockRealTimeData)

      const request = new NextRequest('http://localhost:3000/api/analytics/realtime')
      const response = await getRealTimeAnalytics(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.activeUsers).toBe(1250)
      expect(data.topPages).toHaveLength(1)
      expect(AnalyticsService.getRealTimeAnalytics).toHaveBeenCalled()
    })
  })

  describe('/api/analytics/generate', () => {
    it('should generate analytics snapshot for admin users', async () => {
      const mockSession = {
        user: { id: '1', role: 'admin', email: 'admin@test.com' }
      }
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const { AnalyticsService } = require('@/lib/analytics-service')
      AnalyticsService.generateDailySnapshot.mockResolvedValue(undefined)

      const requestBody = { date: '2024-01-15' }
      const request = new NextRequest('http://localhost:3000/api/analytics/generate', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      const response = await generateAnalytics(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('Analytics snapshot generated')
      expect(AnalyticsService.generateDailySnapshot).toHaveBeenCalledWith(new Date('2024-01-15'))
    })

    it('should return 403 for non-admin users', async () => {
      const mockSession = {
        user: { id: '1', role: 'analytics', email: 'analytics@test.com' }
      }
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const request = new NextRequest('http://localhost:3000/api/analytics/generate', {
        method: 'POST',
        body: JSON.stringify({ date: '2024-01-15' })
      })

      const response = await generateAnalytics(request)

      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.error).toBe('Forbidden')
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockSession = {
        user: { id: '1', role: 'analytics', email: 'analytics@test.com' }
      }
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const { AnalyticsService } = require('@/lib/analytics-service')
      AnalyticsService.getAnalyticsOverview.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/analytics/overview')
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to fetch analytics overview')
    })
  })
})