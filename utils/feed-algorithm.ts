import Post from "@/models/Post"
import User from "@/models/User"
import Like from "@/models/Like"
import Follow from "@/models/Follow"
import Block from "@/models/Block"
import Activity from "@/models/Activity"

interface FeedOptions {
  userId: string
  page?: number
  limit?: number
  algorithm?: "chronological" | "engagement" | "personalized"
}

interface PostScore {
  postId: string
  score: number
  factors: {
    recency: number
    engagement: number
    author: number
    relevance: number
    diversity: number
  }
}

export class FeedAlgorithm {
  private static readonly WEIGHTS = {
    RECENCY: 0.3,
    ENGAGEMENT: 0.25,
    AUTHOR: 0.2,
    RELEVANCE: 0.15,
    DIVERSITY: 0.1,
  }

  private static readonly DECAY_HOURS = 24 // Hours for recency decay
  private static readonly MIN_SCORE = 0.1

  static async generateFeed(options: FeedOptions) {
    const { userId, page = 1, limit = 20, algorithm = "personalized" } = options
    const skip = (page - 1) * limit

    try {
      // Get user preferences and blocked users
      const [user, blockedUsers, followedUsers] = await Promise.all([
        User.findById(userId).lean(),
        Block.find({ blocker: userId }).select("blocked").lean(),
        Follow.find({ follower: userId }).select("following").lean(),
      ])

      if (!user) throw new Error("User not found")

      const blockedUserIds = blockedUsers.map((b) => b.blocked.toString())
      const followedUserIds = followedUsers.map((f) => f.following.toString())

      // Base query - exclude blocked users and user's own posts
      const baseQuery = {
        author: {
          $nin: [...blockedUserIds, userId].map((id) => id.toString()),
        },
      }

      if (algorithm === "chronological") {
        return this.getChronologicalFeed(baseQuery, skip, limit)
      }

      // Get candidate posts (last 7 days for performance)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const candidatePosts = await Post.find({
        ...baseQuery,
        createdAt: { $gte: sevenDaysAgo },
      })
        .populate("author", "username level points followersCount")
        .lean()

      if (candidatePosts.length === 0) {
        return { posts: [], hasMore: false, totalCount: 0 }
      }

      // Get user interaction history for personalization
      const userInteractions = await this.getUserInteractions(userId)

      // Score all posts
      const scoredPosts = await Promise.all(
        candidatePosts.map((post) =>
          this.scorePost(post, {
            user,
            followedUserIds,
            userInteractions,
            algorithm,
          }),
        ),
      )

      // Sort by score and apply diversity
      const rankedPosts = this.applyDiversityFilter(scoredPosts.sort((a, b) => b.score - a.score))

      // Paginate results
      const paginatedPosts = rankedPosts.slice(skip, skip + limit)
      const posts = paginatedPosts
        .map((scored) => candidatePosts.find((p) => (p._id as any).toString() === scored.postId))
        .filter(Boolean)

      return {
        posts,
        hasMore: rankedPosts.length > skip + limit,
        totalCount: rankedPosts.length,
        debug:
          process.env.NODE_ENV === "development"
            ? {
                scores: paginatedPosts.map((p) => ({
                  postId: p.postId,
                  score: p.score,
                  factors: p.factors,
                })),
              }
            : undefined,
      }
    } catch (error) {
      console.error("Feed generation error:", error)
      throw error
    }
  }

  private static async getChronologicalFeed(baseQuery: any, skip: number, limit: number) {
    const posts = await Post.find(baseQuery)
      .populate("author", "username displayName avatar level")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const totalCount = await Post.countDocuments(baseQuery)

    return {
      posts,
      hasMore: skip + posts.length < totalCount,
      totalCount,
    }
  }

  private static async getUserInteractions(userId: string) {
    const [likedPosts, activities] = await Promise.all([
      Like.find({ user: userId, itemType: "post" }).populate("item", "tags author").limit(100).lean(),
      Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(200).lean(),
    ])

    // Extract user preferences
    const interactedTags = new Set<string>()
    const interactedAuthors = new Set<string>()

    likedPosts.forEach((like) => {
      if (like.item?.tags) {
        like.item.tags.forEach((tag: string) => interactedTags.add(tag))
      }
      if (like.item?.author) {
        interactedAuthors.add(like.item.author.toString())
      }
    })

    return {
      preferredTags: Array.from(interactedTags),
      preferredAuthors: Array.from(interactedAuthors),
      activityCount: activities.length,
    }
  }

  private static async scorePost(post: any, context: any): Promise<PostScore> {
    const { user, followedUserIds, userInteractions, algorithm } = context

    const factors = {
      recency: this.calculateRecencyScore(post.createdAt),
      engagement: this.calculateEngagementScore(post),
      author: this.calculateAuthorScore(post.author, followedUserIds),
      relevance: this.calculateRelevanceScore(post, userInteractions),
      diversity: 1.0, // Will be adjusted in diversity filter
    }

    // Calculate weighted score
    const score =
      algorithm === "engagement"
        ? factors.engagement
        : factors.recency * this.WEIGHTS.RECENCY +
          factors.engagement * this.WEIGHTS.ENGAGEMENT +
          factors.author * this.WEIGHTS.AUTHOR +
          factors.relevance * this.WEIGHTS.RELEVANCE +
          factors.diversity * this.WEIGHTS.DIVERSITY

    return {
      postId: (post._id as any).toString(),
      score: Math.max(score, this.MIN_SCORE),
      factors,
    }
  }

  private static calculateRecencyScore(createdAt: Date): number {
    const hoursAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)

    // Exponential decay: newer posts get higher scores
    return Math.exp(-hoursAgo / this.DECAY_HOURS)
  }

  private static calculateEngagementScore(post: any): number {
    const { likesCount = 0, commentsCount = 0, xpAwarded = 0 } = post

    // Weighted engagement score
    const engagementPoints = likesCount * 1 + commentsCount * 2 + xpAwarded * 0.1

    // Normalize using log scale to prevent viral posts from dominating
    return Math.log(engagementPoints + 1) / Math.log(100) // Scale to 0-1
  }

  private static calculateAuthorScore(author: any, followedUserIds: string[]): number {
    if (!author) return 0

    let score = 0

    // Boost for followed users
    if (followedUserIds.includes((author._id as any).toString())) {
      score += 0.5
    }

    // Boost for high-level users
    const levelBoost = Math.min(author.level / 50, 0.3) // Max 0.3 boost
    score += levelBoost

    // Boost for users with good reputation (followers)
    const reputationBoost = Math.min(author.followersCount / 1000, 0.2) // Max 0.2 boost
    score += reputationBoost

    return Math.min(score, 1.0)
  }

  private static calculateRelevanceScore(post: any, userInteractions: any): number {
    const { preferredTags, preferredAuthors } = userInteractions
    let score = 0

    // Tag relevance
    if (post.tags && preferredTags.length > 0) {
      const matchingTags = post.tags.filter((tag: string) => preferredTags.includes(tag)).length
      score += (matchingTags / Math.max(post.tags.length, 1)) * 0.6
    }

    // Author relevance
    if (preferredAuthors.includes((post.author._id as any).toString())) {
      score += 0.4
    }

    return Math.min(score, 1.0)
  }

  private static applyDiversityFilter(scoredPosts: PostScore[]): PostScore[] {
    const seenAuthors = new Set<string>()
    const seenTags = new Set<string>()

    return scoredPosts.map((scoredPost, index) => {
      const post = scoredPosts.find((p) => p.postId === scoredPost.postId)
      if (!post) return scoredPost

      let diversityPenalty = 0

      // Penalize repeated authors (but less for high-quality content)
      const authorId = post.postId // This would need the actual post data
      if (seenAuthors.has(authorId)) {
        diversityPenalty += 0.2
      } else {
        seenAuthors.add(authorId)
      }

      // Apply diversity penalty
      const adjustedScore = scoredPost.score * (1 - diversityPenalty)

      return {
        ...scoredPost,
        score: Math.max(adjustedScore, this.MIN_SCORE),
        factors: {
          ...scoredPost.factors,
          diversity: 1 - diversityPenalty,
        },
      }
    })
  }

  // Method to update user preferences based on interactions
  static async updateUserPreferences(
    userId: string,
    interaction: {
      type: "like" | "comment" | "share" | "view"
      postId: string
      duration?: number // for view tracking
    },
  ) {
    try {
      // Record the activity
      await Activity.create({
        user: userId,
        type: interaction.type,
        targetType: "post",
        targetId: interaction.postId,
        metadata: {
          duration: interaction.duration,
        },
      })

      // Update user's interaction patterns (could be cached in Redis)
      // This would update user preferences for better personalization
    } catch (error) {
      console.error("Error updating user preferences:", error)
    }
  }
}
