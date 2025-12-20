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
  authorId?: string
  tags?: string[]
}

interface PostMeta {
  authorId?: string
  tags?: string[]
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
        User.findById(userId).lean() as Promise<any>,
        Block.find({ blocker: userId } as any).select("blocked").lean(),
        Follow.find({ follower: userId } as any).select("following").lean(),
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
      } as any)
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
        .map((scored) => candidatePosts.find((p) => (p._id as any)?.toString() === scored.postId))
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
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Feed generation error:", errorMessage)
      throw error
    }
  }

  private static async getChronologicalFeed(baseQuery: unknown, skip: number, limit: number) {
    const posts = await Post.find(baseQuery as any)
      .populate("author", "username displayName avatar level")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const totalCount = await Post.countDocuments(baseQuery as any)

    return {
      posts,
      hasMore: skip + posts.length < totalCount,
      totalCount,
    }
  }

  private static async getUserInteractions(userId: string) {
    const [likedPosts, activities] = await Promise.all([
      Like.find({ user: userId, targetType: "post" } as any).populate("targetId", "tags author").limit(100).lean(),
      Activity.find({ user: userId } as any).sort({ createdAt: -1 }).limit(200).lean(),
    ])

    // Extract user preferences
    const interactedTags = new Set<string>()
    const interactedAuthors = new Set<string>()

    likedPosts.forEach((like) => {
      const item = like.targetId as any;
      if (item?.tags) {
        item.tags.forEach((tag: string) => interactedTags.add(tag))
      }
      if (item?.author) {
        interactedAuthors.add(item.author.toString())
      }
    })

    return {
      preferredTags: Array.from(interactedTags),
      preferredAuthors: Array.from(interactedAuthors),
      activityCount: activities.length,
    }
  }

  private static async scorePost(post: Record<string, unknown>, context: Record<string, unknown>): Promise<PostScore> {
    const { user, followedUserIds, userInteractions, algorithm } = context

    const postAuthor = post.author as Record<string, unknown> | undefined

    const factors = {
      recency: this.calculateRecencyScore(post.createdAt as Date),
      engagement: this.calculateEngagementScore(post),
      author: this.calculateAuthorScore(postAuthor || {}, followedUserIds as string[]),
      relevance: this.calculateRelevanceScore(post, userInteractions as Record<string, unknown>),
      diversity: 1.0, // Will be adjusted in diversity filter
    }

    // Dynamic weighting: favor recency for very new posts, engagement for older posts
    // recency in (0..1) where 1 is newest. We'll shift a small amount of weight from RECENCY -> ENGAGEMENT
    // as recency declines so high-engagement older posts can surface.
    const recencyFactor = factors.recency

    // allow up to 0.12 weight shift depending on age
    const shift = (1 - recencyFactor) * 0.12
    const dynamicRecencyWeight = Math.max(this.WEIGHTS.RECENCY - shift, 0)
    const dynamicEngagementWeight = Math.min(this.WEIGHTS.ENGAGEMENT + shift, this.WEIGHTS.ENGAGEMENT + 0.12)

    const baseScore =
      algorithm === "engagement"
        ? factors.engagement
        : factors.recency * dynamicRecencyWeight +
          factors.engagement * dynamicEngagementWeight +
          factors.author * this.WEIGHTS.AUTHOR +
          factors.relevance * this.WEIGHTS.RELEVANCE +
          factors.diversity * this.WEIGHTS.DIVERSITY

    const author = post.author as { _id?: any } | undefined
    return {
      postId: (post._id as any).toString(),
      score: Math.max(baseScore, this.MIN_SCORE),
      factors,
      authorId: author?._id ? author._id.toString() : undefined,
      tags: Array.isArray(post.tags) ? post.tags as string[] : [],
    }
  }

  private static calculateRecencyScore(createdAt: Date): number {
    const hoursAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)

    // Exponential decay: newer posts get higher scores
    return Math.exp(-hoursAgo / this.DECAY_HOURS)
  }

  private static calculateEngagementScore(post: Record<string, unknown>): number {
    const likesCount = (post.likesCount as number) || 0
    const commentsCount = (post.commentsCount as number) || 0
    const xpAwarded = (post.xpAwarded as number) || 0

    // Weighted engagement score
  const engagementPoints = likesCount * 1 + commentsCount * 2 + xpAwarded * 0.2

  // Normalize using log scale to prevent viral posts from dominating. Use a larger base so
  // stronger posts still scale without fully dominating.
  const normalized = Math.log(engagementPoints + 1) / Math.log(1000)
  return Math.min(Math.max(normalized, 0), 1)
  }

  private static calculateAuthorScore(author: Record<string, unknown>, followedUserIds: string[]): number {
    if (!author) return 0

    let score = 0

    // Boost for followed users
    if (followedUserIds.includes((author._id as any)?.toString())) {
      score += 0.5
    }

    // Boost for high-level users
    const levelBoost = Math.min((author.level as number || 0) / 50, 0.3) // Max 0.3 boost
    score += levelBoost

    // Boost for users with good reputation (followers)
    const reputationBoost = Math.min((author.followersCount as number || 0) / 1000, 0.2) // Max 0.2 boost
    score += reputationBoost

    return Math.min(score, 1.0)
  }

  private static calculateRelevanceScore(post: Record<string, unknown>, userInteractions: Record<string, unknown>): number {
    const preferredTags = (userInteractions.preferredTags as string[]) || []
    const preferredAuthors = (userInteractions.preferredAuthors as string[]) || []
    let score = 0

    // Tag relevance
    const postTags = post.tags as string[] | undefined
    if (postTags && preferredTags.length > 0) {
      const matchingTags = postTags.filter((tag: string) => preferredTags.includes(tag)).length
      score += (matchingTags / Math.max(postTags.length, 1)) * 0.6
    }

    // Author relevance
    const author = post.author as { _id?: any } | undefined
    if (author?._id && preferredAuthors.includes(author._id.toString())) {
      score += 0.4
    }

    return Math.min(score, 1.0)
  }

  private static applyDiversityFilter(scoredPosts: PostScore[]): PostScore[] {
    const seenAuthors = new Set<string>()
    const seenTags = new Set<string>()

    return scoredPosts.map((scoredPost) => {
      const authorId = scoredPost.authorId
      const tags = scoredPost.tags || []

      let diversityPenalty = 0

      // Penalize repeated authors (but cap penalty so good posts still show)
      if (authorId) {
        if (seenAuthors.has(authorId)) {
          diversityPenalty += 0.18
        } else {
          seenAuthors.add(authorId)
        }
      }

      // Penalize if many posts share the same dominant tag
      for (const t of tags) {
        if (seenTags.has(t)) {
          diversityPenalty += 0.05
        } else {
          seenTags.add(t)
        }
      }

      // Cap penalty to avoid removing good content entirely
      diversityPenalty = Math.min(diversityPenalty, 0.5)

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
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error updating user preferences:", errorMessage)
    }
  }
}
