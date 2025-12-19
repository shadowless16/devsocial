import WeeklyChallenge from "../models/WeeklyChallenge"
import ChallengeParticipation from "../models/ChallengeParticipation"
import UserStats from "../models/UserStats"
import { awardXP } from "./awardXP"
import { connectDB } from "../config/database"

export class ChallengeSystem {
  static async getActiveChallenges(): Promise<any[]> {
    await connectDB()

    const now = new Date()
    return await WeeklyChallenge.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    } as any).sort({ createdAt: -1 })
  }

  static async joinChallenge(userId: string, challengeId: string): Promise<unknown> {
    await connectDB()

    const challenge = await WeeklyChallenge.findById(challengeId) as typeof WeeklyChallenge.prototype | null
    if (!challenge || !challenge.isActive) {
      throw new Error("Challenge not found or inactive")
    }

    // Check if user already joined
    const existingParticipation = await ChallengeParticipation.findOne({
      user: userId,
      challenge: challengeId,
    } as any)

    if (existingParticipation) {
      throw new Error("Already participating in this challenge")
    }

    // Create participation record
    const participation = new ChallengeParticipation({
      user: userId,
      challenge: challengeId,
      status: "active",
      progress: 0,
    })

    await participation.save()

    // Update challenge participant count
    await WeeklyChallenge.findByIdAndUpdate(challengeId, {
      $inc: { participantCount: 1 },
    } as any)

    return participation
  }

  static async updateProgress(userId: string, challengeId: string, progressData: unknown): Promise<void> {
    await connectDB()

    const participation = await ChallengeParticipation.findOne({
      user: userId,
      challenge: challengeId,
      status: "active",
    } as any)

    if (!participation) return

    const challenge = await WeeklyChallenge.findById(challengeId) as typeof WeeklyChallenge.prototype | null
    if (!challenge) return

    const data = progressData as { engagementCount?: number; progress?: number }

    // Calculate progress based on challenge type
    let newProgress = 0

    switch (challenge.type) {
      case "post_creation":
        const userStats = await UserStats.findOne({ user: userId } as any)
        newProgress = Math.min(100, ((userStats?.totalPosts || 0) / challenge.requirements.target) * 100)
        break
      case "engagement":
        newProgress = Math.min(100, ((data.engagementCount || 0) / challenge.requirements.target) * 100)
        break
      default:
        newProgress = data.progress || 0
    }

    participation.progress = newProgress

    // Check if challenge is completed
    if (newProgress >= 100 && participation.status === "active") {
      await this.completeChallenge(userId, challengeId)
    } else {
      await participation.save()
    }
  }

  static async completeChallenge(userId: string, challengeId: string): Promise<void> {
    await connectDB()

    const participation = await ChallengeParticipation.findOne({
      user: userId,
      challenge: challengeId,
    } as any)

    const challenge = await WeeklyChallenge.findById(challengeId) as typeof WeeklyChallenge.prototype | null

    if (!participation || !challenge) return

    // Check if this is the first completion
    const completionCount = await ChallengeParticipation.countDocuments({
      challenge: challengeId,
      status: "completed",
    } as any)

    const isFirstCompletion = completionCount === 0

    // Calculate XP reward
    let xpReward = challenge.rewards.xp
    if (isFirstCompletion) {
      xpReward += challenge.firstCompletionBonus
    }

    // Update participation
    participation.status = "completed"
    participation.completedAt = new Date()
    participation.isFirstCompletion = isFirstCompletion
    participation.xpEarned = xpReward
    participation.progress = 100

    await participation.save()

    // Award XP
    await awardXP(userId, "challenge_completion", challengeId)

    // Update challenge completion count
    await WeeklyChallenge.findByIdAndUpdate(challengeId, {
      $inc: { completionCount: 1 },
    } as any)

    // Update user stats
    await UserStats.findOneAndUpdate({ user: userId }, { $inc: { challengesCompleted: 1 } }, { upsert: true })
  }

  static async getUserChallenges(userId: string): Promise<any[]> {
    await connectDB()

    return await ChallengeParticipation.find({ user: userId } as any).populate("challenge").sort({ createdAt: -1 })
  }

  static async getChallengeLeaderboard(challengeId: string): Promise<any[]> {
    await connectDB()

    return await ChallengeParticipation.find({
      challenge: challengeId,
      status: { $in: ["active", "completed"] },
    } as any)
      .populate("user", "username displayName avatar level")
      .sort({ progress: -1, completedAt: 1 })
      .limit(50)
  }

  static async createWeeklyChallenge(challengeData: unknown, creatorId: string): Promise<unknown> {
    await connectDB()

    const challenge = new WeeklyChallenge({
      ...(challengeData as any),
      createdBy: creatorId,
    })

    await challenge.save()
    return challenge
  }
}
