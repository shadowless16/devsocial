import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Activity from "@/models/Activity"
import Post from "@/models/Post"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const type = searchParams.get("type")

    // Get both activities and posts
    const [activities, posts] = await Promise.all([
      Activity.find({ user: session.user.id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Post.find({ author: session.user.id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
    ])

    // Transform activities
    const transformedActivities = activities.map(activity => ({
      type: activity.type === 'post_created' ? 'post' : activity.type,
      title: getActivityTitle(activity.type),
      description: activity.description || getActivityDescription(activity.type),
      content: activity.metadata?.content,
      timestamp: getRelativeTime(activity.createdAt),
      xpEarned: activity.xpEarned,
      createdAt: activity.createdAt,
      engagement: {
        likes: activity.metadata?.likes || 0,
        comments: activity.metadata?.comments || 0,
        shares: activity.metadata?.shares || 0
      }
    }))

    // Transform posts
    const transformedPosts = posts.map(post => ({
      type: 'post',
      title: 'Created a new post',
      description: post.title || post.content?.substring(0, 100) + '...' || 'Shared new content',
      content: post.content,
      timestamp: getRelativeTime(post.createdAt),
      xpEarned: post.xpAwarded || 10,
      createdAt: post.createdAt,
      engagement: {
        likes: post.likesCount || 0,
        comments: post.commentsCount || 0,
        shares: 0
      }
    }))

    // Combine and sort by date
    const combined = [...transformedActivities, ...transformedPosts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)

    // Filter by type if specified
    const filtered = type && type !== 'all' 
      ? combined.filter(item => item.type === type)
      : combined

    return NextResponse.json({ activities: filtered })
  } catch (error) {
    console.error("Get profile activity error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getActivityTitle(type: string): string {
  switch (type) {
    case 'post_creation': return 'Created a new post'
    case 'comment_creation': return 'Commented on a post'
    case 'like_given': return 'Liked a post'
    case 'challenge_completion': return 'Completed a challenge'
    case 'user_followed': return 'Followed a user'
    default: return 'Activity'
  }
}

function getActivityDescription(type: string): string {
  switch (type) {
    case 'post_creation': return 'Shared new content with the community'
    case 'comment_creation': return 'Engaged in a discussion'
    case 'like_given': return 'Showed appreciation for content'
    case 'challenge_completion': return 'Successfully completed a coding challenge'
    case 'user_followed': return 'Connected with another developer'
    default: return 'Performed an action'
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}