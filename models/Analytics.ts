import mongoose from 'mongoose'

// User Analytics Schema
const userAnalyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, index: true },
  totalUsers: { type: Number, default: 0 },
  newUsers: { type: Number, default: 0 },
  activeUsers: { type: Number, default: 0 },
  dailyActiveUsers: { type: Number, default: 0 },
  weeklyActiveUsers: { type: Number, default: 0 },
  monthlyActiveUsers: { type: Number, default: 0 },
  userRetention: {
    day1: { type: Number, default: 0 },
    day7: { type: Number, default: 0 },
    day30: { type: Number, default: 0 }
  },
  demographics: {
    countries: [{ 
      country: String, 
      count: Number, 
      percentage: Number 
    }],
    devices: [{
      device: String,
      count: Number,
      percentage: Number
    }]
  }
}, { timestamps: true })

// Content Analytics Schema
const contentAnalyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, index: true },
  totalPosts: { type: Number, default: 0 },
  newPosts: { type: Number, default: 0 },
  totalComments: { type: Number, default: 0 },
  newComments: { type: Number, default: 0 },
  totalLikes: { type: Number, default: 0 },
  newLikes: { type: Number, default: 0 },
  totalShares: { type: Number, default: 0 },
  newShares: { type: Number, default: 0 },
  engagementRate: { type: Number, default: 0 },
  topTags: [{
    tag: String,
    count: Number,
    growth: Number
  }],
  contentTypes: [{
    type: String, // 'text', 'image', 'code', 'link'
    count: Number,
    percentage: Number
  }]
}, { timestamps: true })

// Platform Analytics Schema
const platformAnalyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, index: true },
  pageViews: { type: Number, default: 0 },
  uniquePageViews: { type: Number, default: 0 },
  sessionDuration: { type: Number, default: 0 }, // in seconds
  bounceRate: { type: Number, default: 0 },
  topPages: [{
    page: String,
    views: Number,
    uniqueUsers: Number
  }],
  peakHours: [{
    hour: Number, // 0-23
    activeUsers: Number
  }],
  realTimeMetrics: {
    activeUsers: { type: Number, default: 0 },
    currentSessions: { type: Number, default: 0 },
    recentActivity: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      action: String,
      target: String,
      timestamp: { type: Date, default: Date.now }
    }]
  }
}, { timestamps: true })

// Gamification Analytics Schema
const gamificationAnalyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, index: true },
  totalXP: { type: Number, default: 0 },
  xpDistribution: [{
    source: String, // 'post', 'comment', 'like', 'daily_login', 'challenge'
    amount: Number,
    count: Number
  }],
  badgeStats: [{
    badgeId: String,
    badgeName: String,
    totalEarned: Number,
    newEarned: Number
  }],
  challengeStats: {
    totalChallenges: { type: Number, default: 0 },
    activeChallenges: { type: Number, default: 0 },
    completedChallenges: { type: Number, default: 0 },
    participationRate: { type: Number, default: 0 }
  },
  levelDistribution: [{
    level: Number,
    userCount: Number,
    percentage: Number
  }]
}, { timestamps: true })

// Growth Analytics Schema
const growthAnalyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, index: true },
  growthRate: {
    daily: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 }
  },
  acquisitionChannels: [{
    channel: String, // 'organic', 'referral', 'social', 'direct'
    users: Number,
    percentage: Number
  }],
  churnRate: { type: Number, default: 0 },
  ltv: { type: Number, default: 0 }, // Lifetime Value
  cohortAnalysis: [{
    cohort: String, // 'YYYY-MM'
    size: Number,
    retention: [{
      period: Number, // weeks since signup
      retained: Number,
      percentage: Number
    }]
  }]
}, { timestamps: true })

// Create indexes for better query performance
userAnalyticsSchema.index({ date: -1 })
contentAnalyticsSchema.index({ date: -1 })
platformAnalyticsSchema.index({ date: -1 })
gamificationAnalyticsSchema.index({ date: -1 })
growthAnalyticsSchema.index({ date: -1 })

export const UserAnalytics = mongoose.models.UserAnalytics || mongoose.model('UserAnalytics', userAnalyticsSchema)
export const ContentAnalytics = mongoose.models.ContentAnalytics || mongoose.model('ContentAnalytics', contentAnalyticsSchema)
export const PlatformAnalytics = mongoose.models.PlatformAnalytics || mongoose.model('PlatformAnalytics', platformAnalyticsSchema)
export const GamificationAnalytics = mongoose.models.GamificationAnalytics || mongoose.model('GamificationAnalytics', gamificationAnalyticsSchema)
export const GrowthAnalytics = mongoose.models.GrowthAnalytics || mongoose.model('GrowthAnalytics', growthAnalyticsSchema)