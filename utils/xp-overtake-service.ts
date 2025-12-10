import mongoose from "mongoose"
import User from "@/models/User"
import Notification from "@/models/Notification"
import LeaderboardSnapshot from "@/models/LeaderboardSnapshot"
import connectDB from "@/lib/core/db"
import { sendPushNotification } from "@/lib/notifications/push-notification"

interface LeaderboardEntry {
  userId: string | mongoose.Types.ObjectId
  username: string
  rank: number
  totalXP: number
}

export class XPOvertakeService {
  static async checkAndNotifyOvertakes(type: 'all-time' | 'weekly' | 'monthly' = 'all-time') {
    try {
      await connectDB()

      const currentLeaderboard = await this.getCurrentLeaderboard(type)
      const previousSnapshots = await LeaderboardSnapshot.find({ type } as any)

      if (previousSnapshots.length === 0) {
        await this.saveCurrentSnapshot(currentLeaderboard, type)
        return { success: true, overtakes: 0 }
      }

      const previousRankMap = new Map(
        previousSnapshots.map(s => [s.userId.toString(), s.rank])
      )

      const overtakes: Array<{
        overtaker: string
        overtaken: string
        newRank: number
        oldRank: number
      }> = []

      for (const current of currentLeaderboard) {
        const userId = current.userId.toString()
        const currentRank = current.rank
        const previousRank = previousRankMap.get(userId)

        if (previousRank && currentRank < previousRank) {
          for (const prevSnapshot of previousSnapshots) {
            const prevUserId = prevSnapshot.userId.toString()
            if (prevUserId === userId) continue
            
            const prevUserRank = prevSnapshot.rank
            if (prevUserRank >= currentRank && prevUserRank < previousRank) {
              const currentUserEntry = currentLeaderboard.find(u => u.userId.toString() === prevUserId)
              if (currentUserEntry && currentUserEntry.rank > currentRank) {
                overtakes.push({
                  overtaker: userId,
                  overtaken: prevUserId,
                  newRank: currentRank,
                  oldRank: previousRank
                })
              }
            }
          }
        }
      }

      await this.saveCurrentSnapshot(currentLeaderboard, type)

      for (const overtake of overtakes) {
        await this.sendOvertakeNotifications(overtake)
      }

      return { success: true, overtakes: overtakes.length }
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Error checking overtakes:', errorMessage)
      return { success: false, error }
    }
  }

  private static async getCurrentLeaderboard(type: 'all-time' | 'weekly' | 'monthly'): Promise<LeaderboardEntry[]> {
    const XPLog = (await import('@/models/XPLog')).default

    if (type === 'weekly') {
      const startOfWeek = this.getStartOfWeek()
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)

      const weeklyXP = await XPLog.aggregate([
        { $match: { createdAt: { $gte: startOfWeek, $lt: endOfWeek } } },
        { $group: { _id: '$userId', weeklyXP: { $sum: '$xpAmount' } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $sort: { weeklyXP: -1 } },
        { $limit: 100 }
      ])

      return weeklyXP.map((entry: Record<string, unknown>, index: number) => {
        const user = entry.user as { username: string }
        return {
          userId: entry._id as string | mongoose.Types.ObjectId,
          username: user.username,
          rank: index + 1,
          totalXP: (entry.weeklyXP as number) || 0
        }
      })
    }

    if (type === 'monthly') {
      const startOfMonth = this.getStartOfMonth()
      const endOfMonth = new Date(startOfMonth)
      endOfMonth.setMonth(startOfMonth.getMonth() + 1)

      const monthlyXP = await XPLog.aggregate([
        { $match: { createdAt: { $gte: startOfMonth, $lt: endOfMonth } } },
        { $group: { _id: '$userId', monthlyXP: { $sum: '$xpAmount' } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $sort: { monthlyXP: -1 } },
        { $limit: 100 }
      ])

      return monthlyXP.map((entry: Record<string, unknown>, index: number) => {
        const user = entry.user as { username: string }
        return {
          userId: entry._id as string | mongoose.Types.ObjectId,
          username: user.username,
          rank: index + 1,
          totalXP: (entry.monthlyXP as number) || 0
        }
      })
    }

    const users = await User.find()
      .select('_id username points')
      .sort({ points: -1 })
      .limit(100)
      .lean()

    return users.map((user, index) => ({
      userId: user._id,
      username: user.username,
      rank: index + 1,
      totalXP: user.points || 0
    }))
  }

  private static getStartOfWeek() {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - daysToSubtract)
    startOfWeek.setHours(0, 0, 0, 0)
    return startOfWeek
  }

  private static getStartOfMonth() {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }

  private static async saveCurrentSnapshot(leaderboard: LeaderboardEntry[], type: string) {
    await LeaderboardSnapshot.deleteMany({ 
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })

    const snapshots = leaderboard.map(entry => ({
      userId: entry.userId instanceof mongoose.Types.ObjectId ? entry.userId : new mongoose.Types.ObjectId(entry.userId),
      rank: entry.rank,
      totalXP: entry.totalXP,
      type: type as 'weekly' | 'monthly' | 'all-time'
    }))

    await LeaderboardSnapshot.insertMany(snapshots)
  }

  private static async sendOvertakeNotifications(overtake: {
    overtaker: string
    overtaken: string
    newRank: number
    oldRank: number
  }) {
    const [overtakerUser, overtakenUser] = await Promise.all([
      User.findById(overtake.overtaker).select('username avatar pushSubscription') as Promise<typeof User.prototype | null>,
      User.findById(overtake.overtaken).select('username avatar pushSubscription') as Promise<typeof User.prototype | null>
    ])

    if (!overtakerUser || !overtakenUser) return

    await Notification.create({
      recipient: overtake.overtaker,
      sender: overtake.overtaken,
      type: 'xp_overtake',
      title: '🔥 XP Overtake!',
      message: `You just overtook @${overtakenUser.username} in XP — keep it up!`,
      actionUrl: '/leaderboard'
    })

    await Notification.create({
      recipient: overtake.overtaken,
      sender: overtake.overtaker,
      type: 'xp_overtaken',
      title: '⚡ XP Challenge!',
      message: `@${overtakerUser.username} just overtook you in XP — time to level up!`,
      actionUrl: '/leaderboard'
    })

    if (overtakerUser.pushSubscription) {
      await sendPushNotification(overtakerUser.pushSubscription, {
        title: '🔥 XP Overtake!',
        body: `You just overtook @${overtakenUser.username} in XP — keep it up!`,
        url: '/leaderboard',
        icon: '/icon-192x192.png'
      })
    }

    if (overtakenUser.pushSubscription) {
      await sendPushNotification(overtakenUser.pushSubscription, {
        title: '⚡ XP Challenge!',
        body: `@${overtakerUser.username} just overtook you in XP — time to level up!`,
        url: '/leaderboard',
        icon: '/icon-192x192.png'
      })
    }
  }

  static async notifySpecificOvertake(overtakerId: string, overtakenId: string) {
    try {
      await connectDB()

      const [overtaker, overtaken] = await Promise.all([
        User.findById(overtakerId).select('username avatar pushSubscription points') as Promise<typeof User.prototype | null>,
        User.findById(overtakenId).select('username avatar pushSubscription points') as Promise<typeof User.prototype | null>
      ])

      if (!overtaker || !overtaken) return { success: false }

      if (overtaker.points <= overtaken.points) {
        return { success: false, message: 'No overtake occurred' }
      }

      await Notification.create({
        recipient: overtakerId,
        sender: overtakenId,
        type: 'xp_overtake',
        title: '🔥 XP Overtake!',
        message: `You just overtook @${overtaken.username} in XP — keep it up!`,
        actionUrl: '/leaderboard'
      })

      await Notification.create({
        recipient: overtakenId,
        sender: overtakerId,
        type: 'xp_overtaken',
        title: '⚡ XP Challenge!',
        message: `@${overtaker.username} just overtook you in XP — time to level up!`,
        actionUrl: '/leaderboard'
      })

      if (overtaker.pushSubscription) {
        await sendPushNotification(overtaker.pushSubscription, {
          title: '🔥 XP Overtake!',
          body: `You just overtook @${overtaken.username} in XP — keep it up!`,
          url: '/leaderboard',
          icon: '/icon-192x192.png'
        })
      }

      if (overtaken.pushSubscription) {
        await sendPushNotification(overtaken.pushSubscription, {
          title: '⚡ XP Challenge!',
          body: `@${overtaker.username} just overtook you in XP — time to level up!`,
          url: '/leaderboard',
          icon: '/icon-192x192.png'
        })
      }

      return { success: true }
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Error sending overtake notification:', errorMessage)
      return { success: false, error }
    }
  }
}
