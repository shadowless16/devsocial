import connectDB from "@/lib/db"
import WeeklyChallenge from "@/models/WeeklyChallenge"
import ChallengeParticipation from "@/models/ChallengeParticipation"
import User from "@/models/User"

interface RecommendationScore {
  challenge: any
  score: number
  reasons: string[]
}

export class ChallengeRecommender {
  static async getRecommendedChallenges(userId: string, limit: number = 10) {
    await connectDB()

    const user = await User.findById(userId)
    if (!user) return []

    // Get active challenges user hasn't joined
    const userChallengeIds = await ChallengeParticipation.find({ user: userId })
      .distinct("challenge")

    const availableChallenges = await WeeklyChallenge.find({
      _id: { $nin: userChallengeIds },
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    })

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

  private static calculateScore(user: any, challenge: any): RecommendationScore {
    let score = 0
    const reasons: string[] = []

    // Experience level matching (40 points max)
    if (challenge.experienceLevel) {
      if (challenge.experienceLevel === user.experienceLevel) {
        score += 40
        reasons.push(`Perfect match for ${user.experienceLevel} level`)
      } else {
        const levelScore = this.getExperienceLevelScore(user.experienceLevel, challenge.experienceLevel)
        score += levelScore
        if (levelScore > 0) {
          reasons.push(`Good fit for your experience level`)
        }
      }
    }

    // Tech stack matching (30 points max)
    if (challenge.techStack && user.techStack) {
      const commonTech = challenge.techStack.filter((tech: string) => 
        user.techStack.some((userTech: string) => 
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
    const difficultyScore = this.getDifficultyScore(user.level, challenge.difficulty)
    score += difficultyScore
    if (difficultyScore > 0) {
      reasons.push(`Appropriate difficulty for level ${user.level}`)
    }

    // Challenge type based on user activity (15 points max)
    const typeScore = this.getTypeScore(user, challenge.type)
    score += typeScore
    if (typeScore > 0) {
      reasons.push(`Matches your activity pattern`)
    }

    // Popularity bonus (10 points max)
    if (challenge.participantCount > 0) {
      const popularityScore = Math.min(10, Math.log(challenge.participantCount + 1) * 2)
      score += popularityScore
      if (challenge.participantCount > 10) {
        reasons.push(`Popular challenge with ${challenge.participantCount} participants`)
      }
    }

    // Completion rate bonus (5 points max)
    if (challenge.participantCount > 0) {
      const completionRate = challenge.completionCount / challenge.participantCount
      if (completionRate > 0.3) {
        score += 5
        reasons.push(`High success rate`)
      }
    }

    return { challenge, score, reasons }
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

  private static getTypeScore(user: any, challengeType: string): number {
    // Simple heuristics based on user behavior
    if (user.points > 5000 && challengeType === "learning") return 15
    if (user.badges.includes("content_creator") && challengeType === "post_creation") return 15
    if (user.badges.includes("helper") && challengeType === "community") return 15
    if (user.loginStreak > 7 && challengeType === "engagement") return 15
    return 8 // Default score for any type
  }
}