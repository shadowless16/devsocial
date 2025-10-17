import { type NextRequest, NextResponse } from "next/server"
import User from "@/models/User"
import Post from "@/models/Post"
import connectDB from "@/lib/db"
import { analyzeSearchQuery, rankSearchResults, generateSearchSummary } from "@/lib/gemini-service"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Search query is required" 
      }, { status: 400 })
    }

    // Analyze query with Gemini AI (with fallback)
    let analysis
    try {
      analysis = await analyzeSearchQuery(query.trim())
    } catch (error) {
      console.warn('AI query analysis failed, using basic search:', error)
      analysis = {
        intent: query.trim(),
        keywords: query.trim().split(' ').filter(Boolean),
        expandedQuery: query.trim()
      }
    }
    
    // Build search regex from expanded query
    const searchTerms = [
      query.trim(),
      ...analysis.keywords,
      ...analysis.expandedQuery.split(' ')
    ].filter(Boolean)
    
    const searchRegex = new RegExp(searchTerms.join('|'), "i")
    
    const results: any = {
      posts: [],
      users: [],
      tags: [],
      aiInsights: {
        intent: analysis.intent,
        keywords: analysis.keywords,
        expandedQuery: analysis.expandedQuery
      }
    }

    // Search posts with expanded terms
    if (type === "all" || type === "posts") {
      const posts = await Post.find({
        $or: [
          { content: searchRegex },
          { tags: { $in: analysis.keywords } }
        ]
      })
        .populate("author", "username displayName avatar level")
        .populate("tags", "name")
        .sort({ createdAt: -1 })
        .limit(50)

      // Rank posts with AI (with fallback)
      let rankedPosts
      try {
        rankedPosts = await rankSearchResults(query, posts)
      } catch (error) {
        console.warn('AI ranking failed, using default order:', error)
        rankedPosts = posts
      }
      
      results.posts = rankedPosts
        .slice(type === "posts" ? skip : 0, type === "posts" ? skip + limit : 10)
        .map(post => ({
          ...post.toObject(),
          id: post._id.toString(),
          relevanceScore: post.relevanceScore,
          aiReason: post.aiReason
        }))
    }

    // Search users
    if (type === "all" || type === "users") {
      const users = await User.find({
        $or: [
          { username: searchRegex },
          { displayName: searchRegex },
          { bio: searchRegex },
          { skills: { $in: analysis.keywords } }
        ],
      })
        .select("username displayName avatar level points bio skills")
        .limit(50)

      let rankedUsers
      try {
        rankedUsers = await rankSearchResults(query, users)
      } catch (error) {
        console.warn('AI user ranking failed, using default order:', error)
        rankedUsers = users
      }
      
      results.users = rankedUsers
        .slice(type === "users" ? skip : 0, type === "users" ? skip + limit : 10)
    }

    // Search tags
    if (type === "all" || type === "tags") {
      const normalizedQuery = query.replace(/^#/, '').toLowerCase().trim()
      const tagSearchTerms = [normalizedQuery, ...analysis.keywords]
      const tagSearchRegex = new RegExp(tagSearchTerms.join('|'), "i")
      
      const postTags = await Post.aggregate([
        { $unwind: "$tags" },
        { $match: { tags: tagSearchRegex } },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: type === "tags" ? limit : 10 }
      ])
      
      results.tags = postTags.map((tag) => ({
        tag: tag._id,
        count: tag.count,
        posts: tag.count,
      }))
    }

    // Generate AI summary (with fallback)
    let summary = ''
    try {
      summary = await generateSearchSummary(query, results)
    } catch (error) {
      console.warn('AI summary generation failed:', error)
      summary = `Found ${results.posts.length} posts, ${results.users.length} users, and ${results.tags.length} tags.`
    }

    return NextResponse.json({
      success: true,
      data: {
        results,
        query,
        type,
        aiSummary: summary,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(results.posts.length / limit),
          totalResults: results.posts.length + results.users.length + results.tags.length,
        },
      }
    })
  } catch (error: any) {
    console.error("Smart search error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Smart search failed" 
    }, { status: 500 })
  }
}
