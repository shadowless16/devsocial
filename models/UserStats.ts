import mongoose, { Schema, type Document } from "mongoose"

export interface IUserStats extends Document {
  user: mongoose.Types.ObjectId

  // XP and Level
  totalXP: number
  currentLevel: number
  currentRank: string

  // Content Stats
  postsCount: number
  totalPosts: number  // Alternative field name used in some places
  commentsCount: number
  likesReceived: number
  likesGiven: number
  
  // Referral Stats
  totalReferrals: number
  
  // Activity tracking
  lastActiveAt: Date

  // Engagement Stats
  maxPostLikes: number
  helpfulSolutions: number
  bugsReported: number

  // Streak Stats
  loginStreak: number
  lastLoginDate: Date
  longestStreak: number

  // Achievement Stats
  badgesEarned: string[]
  challengesCompleted: number
  mentorshipSessions: number

  // Weekly/Monthly Stats
  weeklyXP: number
  monthlyXP: number
  weeklyRank: number
  monthlyRank: number

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

const UserStatsSchema = new Schema<IUserStats>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // XP and Level
    totalXP: {
      type: Number,
      default: 0,
      index: true,
    },
    currentLevel: {
      type: Number,
      default: 1,
    },
    currentRank: {
      type: String,
      default: "tech_jjc",
    },

    // Content Stats
    postsCount: {
      type: Number,
      default: 0,
    },
    totalPosts: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    likesReceived: {
      type: Number,
      default: 0,
    },
    likesGiven: {
      type: Number,
      default: 0,
    },
    
    // Referral Stats
    totalReferrals: {
      type: Number,
      default: 0,
    },
    
    // Activity tracking
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    // Engagement Stats
    maxPostLikes: {
      type: Number,
      default: 0,
    },
    helpfulSolutions: {
      type: Number,
      default: 0,
    },
    bugsReported: {
      type: Number,
      default: 0,
    },

    // Streak Stats
    loginStreak: {
      type: Number,
      default: 0,
    },
    lastLoginDate: {
      type: Date,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },

    // Achievement Stats
    badgesEarned: [
      {
        type: String,
      },
    ],
    challengesCompleted: {
      type: Number,
      default: 0,
    },
    mentorshipSessions: {
      type: Number,
      default: 0,
    },

    // Weekly/Monthly Stats
    weeklyXP: {
      type: Number,
      default: 0,
    },
    monthlyXP: {
      type: Number,
      default: 0,
    },
    weeklyRank: {
      type: Number,
      default: 0,
    },
    monthlyRank: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for leaderboard queries
UserStatsSchema.index({ totalXP: -1 })
UserStatsSchema.index({ weeklyXP: -1 })
UserStatsSchema.index({ monthlyXP: -1 })
UserStatsSchema.index({ currentLevel: -1 })

export default (mongoose.models.UserStats || mongoose.model<IUserStats>("UserStats", UserStatsSchema)) as mongoose.Model<IUserStats>;
