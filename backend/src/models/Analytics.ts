import mongoose from 'mongoose'

// User Analytics Schema
export interface IUserAnalytics extends mongoose.Document {
  date: Date
  totalUsers: number
  newUsers: number
  activeUsers: number
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  userRetention: {
    day1: number
    day7: number
    day30: number
  }
  demographics: {
    countries: Array<{ country: string; count: number; percentage: number }>
    devices: Array<{ device: string; count: number; percentage: number }>
  }
}

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
export interface IContentAnalytics extends mongoose.Document {
  date: Date
  totalPosts: number
  newPosts: number
  totalComments: number
  newComments: number
  totalLikes: number
  newLikes: number
  totalShares: number
  newShares: number
  engagementRate: number
  topTags: Array<{ tag: string; count: number; growth?: number }>
  contentTypes: Array<{ type: string; count: number; percentage: number }>
}

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
export interface IPlatformAnalytics extends mongoose.Document {
  date: Date
  pageViews: number
  uniquePageViews: number
  sessionDuration: number
  bounceRate: number
  topPages: Array<{ page: string; views: number; uniqueUsers: number }>
  peakHours: Array<{ hour: number; activeUsers: number }>
  realTimeMetrics: {
    activeUsers: number
    currentSessions: number
    recentActivity: Array<{ userId: mongoose.Types.ObjectId; action: string; target: string; timestamp: Date }>
  }
}

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
export interface IGamificationAnalytics extends mongoose.Document {
  date: Date
  totalXP: number
  xpDistribution: Array<{ source: string; amount: number; count: number }>
  badgeStats: Array<{ badgeId: string; badgeName: string; totalEarned: number; newEarned: number }>
  challengeStats: {
    totalChallenges: number
    activeChallenges: number
    completedChallenges: number
    participationRate: number
  }
  levelDistribution: Array<{ level: number; userCount: number; percentage: number }>
}

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
export interface IGrowthAnalytics extends mongoose.Document {
  date: Date
  growthRate: {
    daily: number
    weekly: number
    monthly: number
  }
  acquisitionChannels: Array<{ channel: string; users: number; percentage: number }>
  churnRate: number
  ltv: number
  cohortAnalysis: Array<{ cohort: string; size: number; retention: Array<{ period: number; retained: number; percentage: number }> }>
}

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

export const UserAnalytics: mongoose.Model<IUserAnalytics> = mongoose.models.UserAnalytics || mongoose.model<IUserAnalytics>('UserAnalytics', userAnalyticsSchema)
export const ContentAnalytics: mongoose.Model<IContentAnalytics> = mongoose.models.ContentAnalytics || mongoose.model<IContentAnalytics>('ContentAnalytics', contentAnalyticsSchema)
export const PlatformAnalytics: mongoose.Model<IPlatformAnalytics> = mongoose.models.PlatformAnalytics || mongoose.model<IPlatformAnalytics>('PlatformAnalytics', platformAnalyticsSchema)
export const GamificationAnalytics: mongoose.Model<IGamificationAnalytics> = mongoose.models.GamificationAnalytics || mongoose.model<IGamificationAnalytics>('GamificationAnalytics', gamificationAnalyticsSchema)
export const GrowthAnalytics: mongoose.Model<IGrowthAnalytics> = mongoose.models.GrowthAnalytics || mongoose.model<IGrowthAnalytics>('GrowthAnalytics', growthAnalyticsSchema)
