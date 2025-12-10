import connectDB from "@/lib/core/db"
import WeeklyChallenge from "@/models/WeeklyChallenge"
import ChallengeParticipation from "@/models/ChallengeParticipation"
import User from "@/models/User"

interface ChallengeData {
  _id?: string
  experienceLevel?: string
  techStack?: string[]
  difficulty?: string
  type?: string
  participantCount?: number
  completionCount?: number
  toObject?: () => any
}

interface UserData {
  experienceLevel?: string
  techStack?: string[]
  level?: number
  points?: number
  badges?: string[]
  loginStreak?: number
}

interface RecommendationScore {
  challenge: ChallengeData
  score: number
  reasons: string[]
}

export class ChallengeRecommender {
  static async getRecommendedChallenges(userId: string, limit: number = 10) {
    await connectDB()

    const user = await User.findById(userId) as typeof User.prototype | null
    if (!user) return []

    // Get active challenges user hasn't joined
    const userChallengeIds = await ChallengeParticipation.find({ user: userId } as any)
      .distinct("challenge")

    const availableChallenges = await WeeklyChallenge.find({
      _id: { $nin: userChallengeIds },
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    } as any)

    // Score each challenge
    const scoredChallenges: RecommendationScore[] = []

    for (const challenge of availableChallenges) {
      const score = this.calculateScore(user, challenge)
      scoredChallenges.push(score)
    }

    // Sort by score and return top recommendations
    return scoredChallenges
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        ...item.challenge.toObject(),
        recommendationScore: item.score,
        recommendationReasons: item.reasons
      }))
  }

  private static calculateScore(user: unknown, challenge: unknown): RecommendationScore {
    let score = 0
    const reasons: string[] = []
    const userData = user as UserData
    const challengeData = challenge as ChallengeData

    // Experience level matching (40 points max)
    if (challengeData.experienceLevel) {
      if (challengeData.experienceLevel === userData.experienceLevel) {
        score += 40
        reasons.push(`Perfect match for ${userData.experienceLevel} level`)
      } else {
        const levelScore = this.getExperienceLevelScore(userData.experienceLevel || '', challengeData.experienceLevel)
        score += levelScore
        if (levelScore > 0) {
          reasons.push(`Good fit for your experience level`)
        }
      }
    }

    // Tech stack matching (30 points max)
    if (challengeData.techStack && userData.techStack) {
      const commonTech = challengeData.techStack.filter((tech: string) => 
        userData.techStack!.some((userTech: string) => 
          userTech.toLowerCase().includes(tech.toLowerCase()) ||
          tech.toLowerCase().includes(userTech.toLowerCase())
        )
      )
      
      if (commonTech.length > 0) {
        const techScore = Math.min(30, commonTech.length * 10)
        score += techScore
        reasons.push(`Matches your tech stack: ${commonTech.join(', ')}`)
      }
    }

    // User level and difficulty matching (20 points max)
    const difficultyScore = this.getDifficultyScore(userData.level || 1, challengeData.difficulty || '')
    score += difficultyScore
    if (difficultyScore > 0) {
      reasons.push(`Appropriate difficulty for level ${userData.level}`)
    }

    // Challenge type based on user activity (15 points max)
    const typeScore = this.getTypeScore(userData, challengeData.type || '')
    score += typeScore
    if (typeScore > 0) {
      reasons.push(`Matches your activity pattern`)
    }

    // Popularity bonus (10 points max)
    if ((challengeData.participantCount || 0) > 0) {
      const popularityScore = Math.min(10, Math.log((challengeData.participantCount || 0) + 1) * 2)
      score += popularityScore
      if ((challengeData.participantCount || 0) > 10) {
        reasons.push(`Popular challenge with ${challengeData.participantCount} participants`)
      }
    }

    // Completion rate bonus (5 points max)
    if ((challengeData.participantCount || 0) > 0) {
      const completionRate = (challengeData.completionCount || 0) / (challengeData.participantCount || 1)
      if (completionRate > 0.3) {
        score += 5
        reasons.push(`High success rate`)
      }
    }

    return { challenge: challengeData, score, reasons }
  }

  private static getExperienceLevelScore(userLevel: string, challengeLevel: string): number {
    const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }
    const userLevelNum = levels[userLevel as keyof typeof levels] || 1
    const challengeLevelNum = levels[challengeLevel as keyof typeof levels] || 1
    
    const diff = Math.abs(userLevelNum - challengeLevelNum)
    if (diff === 0) return 40
    if (diff === 1) return 25
    if (diff === 2) return 10
    return 0
  }

  private static getDifficultyScore(userLevel: number, difficulty: string): number {
    if (userLevel <= 2 && difficulty === "easy") return 20
    if (userLevel >= 3 && userLevel <= 5 && difficulty === "medium") return 20
    if (userLevel >= 6 && difficulty === "hard") return 20
    if (userLevel <= 3 && difficulty === "medium") return 15
    if (userLevel >= 4 && difficulty === "easy") return 10
    return 5
  }

  private static getTypeScore(user: UserData, challengeType: string): number {
    // Simple heuristics based on user behavior
    if ((user.points || 0) > 5000 && challengeType === "learning") return 15
    if ((user.badges || []).includes("content_creator") && challengeType === "post_creation") return 15
    if ((user.badges || []).includes("helper") && challengeType === "community") return 15
    if ((user.loginStreak || 0) > 7 && challengeType === "engagement") return 15
    return 8 // Default score for any type
  }
}