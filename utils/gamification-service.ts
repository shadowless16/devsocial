import User from "@/models/User"
import UserStats, { IUserStats } from "@/models/UserStats"
import XPLog from "@/models/XPLog"
import connectDB from "@/lib/core/db"
import { 
  calculateXPWithBonuses, 
  type XPAction, 
  isHelpfulContent,
  isWithinDailyCap,
  getStreakBonus,
  hasCodeSnippet 
} from "./xp-system"
import { getRankByXP, getNextRank } from "./rank-system"
import { checkBadgeEligibility, BADGES } from "./badge-system"
import { XPOvertakeService } from "./xp-overtake-service"

export class GamificationService {
  static async awardXP(
    userId: string,
    action: XPAction,
    content?: string,
    refId?: string,
  ): Promise<{
    success: boolean
    xpAwarded: number
    newLevel?: number
    newRank?: string
    badgesEarned?: string[]
    levelUp?: boolean
    rankUp?: boolean
    message?: string
  }> {
    try {
      await connectDB()

      // Get user and stats
      const user = await User.findById(userId)
      if (!user) throw new Error("User not found")

      let userStats = await UserStats.findOne({ userId })
      if (!userStats) {
        userStats = await UserStats.create({ userId })
      }

      // Check daily cap
      const todayCount = await this.getTodayActionCount(userId, action)
      if (!isWithinDailyCap(action, todayCount)) {
        return {
          success: false,
          xpAwarded: 0,
          message: "Daily XP limit reached for this action"
        }
      }

      // Determine bonuses
      const isFirstOfDay = action === "post_created" && 
        await this.isFirstActionOfDay(userId, "post_created")
      const isSolution = action === "comment_created" && 
        !!content && content.toLowerCase().includes("solution")

      // Calculate XP with all bonuses
      const xpAwarded = calculateXPWithBonuses(
        action,
        userStats.currentLevel,
        userStats.loginStreak,
        content,
        {
          isFirstOfDay,
          isSolution
        }
      )

      // Update user stats
      const oldLevel = userStats.currentLevel
      const oldRank = userStats.currentRank

      userStats.totalXP += xpAwarded
      userStats.weeklyXP += xpAwarded
      userStats.monthlyXP += xpAwarded

      // Update level based on XP
      const newLevel = Math.floor(userStats.totalXP / 100) + 1
      userStats.currentLevel = newLevel

      // Update rank
      const newRankData = getRankByXP(userStats.totalXP)
      userStats.currentRank = newRankData.id

      // Update action-specific stats
      await this.updateActionStats(userStats, action)

      // Check for new badges
      const currentBadges = userStats.badgesEarned
      const eligibleBadges = checkBadgeEligibility(userId, {
        accountCreated: true,
        onboardingCompleted: user.bio.length > 0,
        postsCount: userStats.postsCount,
        maxPostLikes: userStats.maxPostLikes,
        helpfulSolutions: userStats.helpfulSolutions,
        loginStreak: userStats.loginStreak,
        bugsReported: userStats.bugsReported,
      })

      const newBadges = eligibleBadges.filter((badge) => !currentBadges.includes(badge.id)).map((badge) => badge.id)

      userStats.badgesEarned = [...currentBadges, ...newBadges]

      await userStats.save()

      // Log XP transaction
      await XPLog.create({
        userId,
        type: action,
        xpAmount: xpAwarded,
        refId,
      })

      // Award bonus XP for level up
      const levelUp = newLevel > oldLevel
      const rankUp = newRankData.id !== oldRank

      if (levelUp) {
        await XPLog.create({
          userId,
          type: "level_up" as XPAction,
          xpAmount: 50,
        })
        userStats.totalXP += 50
        await userStats.save()
      }

      // Check for XP overtakes after significant XP gain
      if (xpAwarded >= 10) {
        Promise.all([
          XPOvertakeService.checkAndNotifyOvertakes('all-time'),
          XPOvertakeService.checkAndNotifyOvertakes('weekly'),
          XPOvertakeService.checkAndNotifyOvertakes('monthly')
        ]).catch(err => console.error('Overtake check failed:', err))
      }

      return {
        success: true,
        xpAwarded: levelUp ? xpAwarded + 50 : xpAwarded,
        newLevel,
        newRank: newRankData.id,
        badgesEarned: newBadges,
        levelUp,
        rankUp,
      }
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error awarding XP:", errorMessage)
      return { success: false, xpAwarded: 0 }
    }
  }

  private static async updateActionStats(userStats: IUserStats, action: XPAction) {
    switch (action) {
      case "post_created":
        userStats.postsCount += 1
        break
      case "comment_created":
        userStats.commentsCount += 1
        break
      case "post_liked":
        userStats.likesGiven += 1
        break
      case "bug_reported":
        userStats.bugsReported += 1
        break
      case "daily_login":
        await this.updateLoginStreak(userStats)
        break
    }
  }

  private static async updateLoginStreak(userStats: IUserStats) {
    const today = new Date()
    const lastLogin = userStats.lastLoginDate

    if (!lastLogin) {
      userStats.loginStreak = 1
    } else {
      const daysDiff = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 1) {
        userStats.loginStreak += 1
      } else if (daysDiff > 1) {
        userStats.loginStreak = 1
      }
      // If daysDiff === 0, user already logged in today
    }

    userStats.lastLoginDate = today
    userStats.longestStreak = Math.max(userStats.longestStreak, userStats.loginStreak)
  }

  static async getLeaderboard(type: "all-time" | "weekly" | "monthly" = "all-time", limit = 50) {
    await connectDB()

    const sortField = type === "all-time" ? "totalXP" : type === "weekly" ? "weeklyXP" : "monthlyXP"

    const leaderboard = await UserStats.find()
      .populate("userId", "username avatar")
      .sort({ [sortField]: -1 })
      .limit(limit)
      .lean()

    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      username: entry.userId.username,
      avatar: entry.userId.avatar,
      xp: entry[sortField],
      level: entry.currentLevel,
      userRank: entry.currentRank,
      badges: entry.badgesEarned.length,
    }))
  }

  static async getUserProgress(userId: string) {
    await connectDB()

    const userStats = await UserStats.findOne({ userId }).populate("userId", "username avatar")
    if (!userStats) return null

    const currentRank = getRankByXP(userStats.totalXP)
    const nextRank = getNextRank(userStats.totalXP)

    return {
      user: userStats.userId,
      totalXP: userStats.totalXP,
      level: userStats.currentLevel,
      currentRank,
      nextRank,
      badges: userStats.badgesEarned.map((badgeId: string) => BADGES.find((badge) => badge.id === badgeId)).filter(Boolean),
      stats: {
        postsCount: userStats.postsCount,
        commentsCount: userStats.commentsCount,
        likesReceived: userStats.likesReceived,
        loginStreak: userStats.loginStreak,
        longestStreak: userStats.longestStreak,
      },
    }
  }

  // Helper method to get today's action count
  private static async getTodayActionCount(userId: string, action: XPAction): Promise<number> {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    
    const count = await XPLog.countDocuments({
      userId,
      type: action,
      createdAt: { $gte: startOfDay }
    })
    
    return count
  }

  // Helper method to check if this is the first action of the day
  private static async isFirstActionOfDay(userId: string, action: XPAction): Promise<boolean> {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    
    const existingAction = await XPLog.findOne({
      userId,
      type: action,
      createdAt: { $gte: startOfDay }
    })
    
    return !existingAction
  }

  // Method to check and award streak bonuses
  static async checkStreakBonuses(userId: string): Promise<number> {
    const userStats = await UserStats.findOne({ userId })
    if (!userStats) return 0
    
    const streakBonus = getStreakBonus(userStats.loginStreak)
    
    if (streakBonus > 0) {
      // Check if streak bonus already awarded today
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      
      const existingBonus = await XPLog.findOne({
        userId,
        type: 'streak_bonus',
        createdAt: { $gte: startOfDay }
      })
      
      if (!existingBonus) {
        await XPLog.create({
          userId,
          type: 'streak_bonus',
          xpAmount: streakBonus
        })
        
        userStats.totalXP += streakBonus
        await userStats.save()
        
        return streakBonus
      }
    }
    
    return 0
  }

  // Method to reset weekly/monthly XP
  static async resetPeriodicalXP(): Promise<void> {
    const now = new Date()
    
    // Reset weekly XP every Monday
    if (now.getDay() === 1) {
      await UserStats.updateMany({}, { weeklyXP: 0 })
    }
    
    // Reset monthly XP on the 1st
    if (now.getDate() === 1) {
      await UserStats.updateMany({}, { monthlyXP: 0 })
    }
  }
}
