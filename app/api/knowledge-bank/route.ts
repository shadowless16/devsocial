import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server-auth'
import connectDB from '@/lib/core/db'
import KnowledgeEntry from '@/models/KnowledgeEntry'
import User from '@/models/User'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

// GET - Fetch knowledge entries
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const technology = searchParams.get('technology')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build query
    interface KnowledgeQuery {
      technology?: string;
      $or?: Array<Record<string, unknown>>;
    }
    
    const query: KnowledgeQuery = {}
    if (technology && technology !== 'All') {
      query.technology = technology
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    const session = await getSession(request)
    const userId = session?.user?.id

    // Fetch entries with pagination
    const entries = await KnowledgeEntry.find(query as Record<string, unknown>)
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Add isLiked field for authenticated users
    const entriesWithLikes = entries.map(entry => ({
      ...entry,
      likes: entry.likes.length,
      isLiked: userId ? entry.likes.some((like: unknown) => like.toString() === userId) : false
    }))

    const total = await KnowledgeEntry.countDocuments(query as Record<string, unknown>)

    return NextResponse.json({
      success: true,
      entries: entriesWithLikes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Error fetching knowledge entries:', errorMessage)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch entries' },
      { status: 500 }
    )
  }
}

// POST - Create new knowledge entry
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectDB()
    const body = await request.json()
    const { title, technology, category, content, codeExample, tags } = body

    // Validation
    if (!title || !technology || !category || !content) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create entry
    const entry = await KnowledgeEntry.create({
      title,
      technology,
      category,
      content,
      codeExample: codeExample || undefined,
      tags: tags || [],
      author: new mongoose.Types.ObjectId(session.user.id)
    })

    // Populate author info
    await entry.populate('author', 'username profilePicture')

    // Award XP to user
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { xp: 15 } // 15 XP for creating knowledge entry
    } as Record<string, unknown>)

    return NextResponse.json({
      success: true,
      entry: {
        ...entry.toObject(),
        likes: 0,
        isLiked: false
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Error creating knowledge entry:', errorMessage)
    return NextResponse.json(
      { success: false, message: 'Failed to create entry' },
      { status: 500 }
    )
  }
}
