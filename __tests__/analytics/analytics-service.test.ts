import { AnalyticsService } from '@/lib/analytics-service'
import { 
  UserAnalytics, 
  ContentAnalytics, 
  PlatformAnalytics, 
  GamificationAnalytics, 
  GrowthAnalytics 
} from '@/models/Analytics'
import User, { IUser } from '@/models/User'
import Post, { IPost } from '@/models/Post'
import Comment, { IComment } from '@/models/Comment'

// Mock the database connection
jest.mock('@/lib/db', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined)
}))

// Mock the models
jest.mock('@/models/Analytics', () => ({
  UserAnalytics: {
    findOneAndUpdate: jest.fn(),
    find: jest.fn()
  },
  ContentAnalytics: {
    findOneAndUpdate: jest.fn(),
    find: jest.fn()
  },
  PlatformAnalytics: {
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn()
  },
  GamificationAnalytics: {
    findOneAndUpdate: jest.fn(),
    find: jest.fn()
  },
  GrowthAnalytics: {
    findOneAndUpdate: jest.fn(),
    find: jest.fn()
  }
}))

jest.mock('@/models/User', () => ({
  User: {
    countDocuments: jest.fn(),
    aggregate: jest.fn()
  }
}))

jest.mock('@/models/Post', () => ({
  Post: {
    countDocuments: jest.fn(),
    aggregate: jest.fn()
  }
}))

jest.mock('@/models/Comment', () => ({
  Comment: {
    countDocuments: jest.fn()
  }
}))

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateDailySnapshot', () => {
    it('should generate analytics snapshot for a given date', async () => {
      const testDate = new Date('2024-01-15')
      
      // Mock the individual generation methods
      jest.spyOn(AnalyticsService, 'generateUserAnalytics').mockResolvedValue(undefined)
      jest.spyOn(AnalyticsService, 'generateContentAnalytics').mockResolvedValue(undefined)
      jest.spyOn(AnalyticsService, 'generatePlatformAnalytics').mockResolvedValue(undefined)
      jest.spyOn(AnalyticsService, 'generateGamificationAnalytics').mockResolvedValue(undefined)
      jest.spyOn(AnalyticsService, 'generateGrowthAnalytics').mockResolvedValue(undefined)

      await AnalyticsService.generateDailySnapshot(testDate)

      expect(AnalyticsService.generateUserAnalytics).toHaveBeenCalled()
      expect(AnalyticsService.generateContentAnalytics).toHaveBeenCalled()
      expect(AnalyticsService.generatePlatformAnalytics).toHaveBeenCalled()
      expect(AnalyticsService.generateGamificationAnalytics).toHaveBeenCalled()
      expect(AnalyticsService.generateGrowthAnalytics).toHaveBeenCalled()
    })

    it('should handle errors during snapshot generation', async () => {
      jest.spyOn(AnalyticsService, 'generateUserAnalytics').mockRejectedValue(new Error('Database error'))

      await expect(AnalyticsService.generateDailySnapshot()).rejects.toThrow('Database error')
    })
  })

  describe('generateUserAnalytics', () => {
    it('should generate user analytics correctly', async () => {
      const startOfDay = new Date('2024-01-15T00:00:00.000Z')
      const endOfDay = new Date('2024-01-15T23:59:59.999Z')
      const yesterday = new Date('2024-01-14')

      // Mock User model methods
      ;(User.countDocuments as jest.Mock)
        .mockResolvedValueOnce(1000) // totalUsers
        .mockResolvedValueOnce(50)   // newUsers
        .mockResolvedValueOnce(300)  // activeUsers
        .mockResolvedValueOnce(800)  // weeklyActiveUsers
        .mockResolvedValueOnce(950)  // monthlyActiveUsers

      ;(User.aggregate as jest.Mock).mockResolvedValue([
        { _id: 'US', count: 400 },
        { _id: 'UK', count: 200 },
        { _id: 'CA', count: 150 }
      ])

      // Mock UserAnalytics.findOneAndUpdate
      ;(UserAnalytics.findOneAndUpdate as jest.Mock).mockResolvedValue({
        totalUsers: 1000,
        newUsers: 50,
        activeUsers: 300
      })

      // Mock retention calculation
      jest.spyOn(AnalyticsService, 'calculateRetention')
        .mockResolvedValueOnce(85) // day1
        .mockResolvedValueOnce(65) // day7
        .mockResolvedValueOnce(45) // day30

      await AnalyticsService.generateUserAnalytics(startOfDay, endOfDay, yesterday)

      expect(User.countDocuments).toHaveBeenCalledTimes(5)
      expect(UserAnalytics.findOneAndUpdate).toHaveBeenCalledWith(
        { date: startOfDay },
        expect.objectContaining({
          totalUsers: 1000,
          newUsers: 50,
          activeUsers: 300,
          userRetention: {
            day1: 85,
            day7: 65,
            day30: 45
          }
        }),
        { upsert: true, new: true }
      )
    })
  })

  describe('generateContentAnalytics', () => {
    it('should generate content analytics correctly', async () => {
      const startOfDay = new Date('2024-01-15T00:00:00.000Z')
      const endOfDay = new Date('2024-01-15T23:59:59.999Z')

      // Mock Post and Comment counts
      ;(Post.countDocuments as jest.Mock)
        .mockResolvedValueOnce(5000) // totalPosts
        .mockResolvedValueOnce(100)  // newPosts

      ;(Comment.countDocuments as jest.Mock)
        .mockResolvedValueOnce(15000) // totalComments
        .mockResolvedValueOnce(300)   // newComments

      // Mock aggregation for likes
      ;(Post.aggregate as jest.Mock)
        .mockResolvedValueOnce([{ totalLikes: 25000 }]) // total likes
        .mockResolvedValueOnce([{ newLikes: 500 }])     // new likes
        .mockResolvedValueOnce([                        // top tags
          { _id: 'javascript', count: 150 },
          { _id: 'react', count: 120 },
          { _id: 'nodejs', count: 100 }
        ])

      ;(ContentAnalytics.findOneAndUpdate as jest.Mock).mockResolvedValue({
        totalPosts: 5000,
        newPosts: 100,
        engagementRate: 8.0
      })

      await AnalyticsService.generateContentAnalytics(startOfDay, endOfDay)

      expect(ContentAnalytics.findOneAndUpdate).toHaveBeenCalledWith(
        { date: startOfDay },
        expect.objectContaining({
          totalPosts: 5000,
          newPosts: 100,
          totalComments: 15000,
          newComments: 300,
          totalLikes: 25000
        }),
        { upsert: true, new: true }
      )
    })
  })

  describe('getAnalyticsOverview', () => {
    it('should return analytics overview for specified days', async () => {
      const mockUserAnalytics = [
        { date: new Date('2024-01-15'), totalUsers: 1000, newUsers: 50 },
        { date: new Date('2024-01-14'), totalUsers: 950, newUsers: 45 }
      ]

      const mockContentAnalytics = [
        { date: new Date('2024-01-15'), totalPosts: 5000, newPosts: 100 },
        { date: new Date('2024-01-14'), totalPosts: 4900, newPosts: 95 }
      ]

      ;(UserAnalytics.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockUserAnalytics)
        })
      })

      ;(ContentAnalytics.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockContentAnalytics)
        })
      })

      ;(PlatformAnalytics.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([])
        })
      })

      ;(GamificationAnalytics.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([])
        })
      })

      ;(GrowthAnalytics.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([])
        })
      })

      const result = await AnalyticsService.getAnalyticsOverview(30)

      expect(result).toHaveProperty('userAnalytics')
      expect(result).toHaveProperty('contentAnalytics')
      expect(result).toHaveProperty('platformAnalytics')
      expect(result).toHaveProperty('gamificationAnalytics')
      expect(result).toHaveProperty('growthAnalytics')
      expect(result.userAnalytics).toEqual(mockUserAnalytics)
      expect(result.contentAnalytics).toEqual(mockContentAnalytics)
    })
  })

  describe('getRealTimeAnalytics', () => {
    it('should return real-time analytics data', async () => {
      const mockPlatformData = {
        topPages: [
          { page: '/feed', views: 1000, uniqueUsers: 800 },
          { page: '/projects', views: 500, uniqueUsers: 400 }
        ]
      }

      ;(PlatformAnalytics.findOne as jest.Mock).mockResolvedValue(mockPlatformData)

      const result = await AnalyticsService.getRealTimeAnalytics()

      expect(result).toHaveProperty('activeUsers')
      expect(result).toHaveProperty('pageViews')
      expect(result).toHaveProperty('newPosts')
      expect(result).toHaveProperty('topPages')
      expect(result).toHaveProperty('deviceDistribution')
      expect(result).toHaveProperty('geographicData')
      expect(typeof result.activeUsers).toBe('number')
      expect(Array.isArray(result.topPages)).toBe(true)
      expect(Array.isArray(result.deviceDistribution)).toBe(true)
    })
  })

  describe('calculateRetention', () => {
    it('should calculate user retention correctly', async () => {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() - 7)

      // Mock users signed up 7 days ago
      ;(User.countDocuments as jest.Mock)
        .mockResolvedValueOnce(100) // users signed up
        .mockResolvedValueOnce(65)  // users still active

      const retention = await AnalyticsService.calculateRetention(7)

      expect(retention).toBe(65) // 65% retention
      expect(User.countDocuments).toHaveBeenCalledTimes(2)
    })

    it('should return 0 when no users signed up on target date', async () => {
      ;(User.countDocuments as jest.Mock).mockResolvedValueOnce(0)

      const retention = await AnalyticsService.calculateRetention(7)

      expect(retention).toBe(0)
    })
  })
})