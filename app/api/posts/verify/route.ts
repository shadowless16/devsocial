import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Post from '@/models/Post'
import { computeContentHash } from '@/lib/contentHash'

// Step 10: Verification endpoint for dispute resolution
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { postId, content } = body
    
    if (!postId && !content) {
      return NextResponse.json(
        { error: 'Either postId or content is required' },
        { status: 400 }
      )
    }
    
    let post: any
    let computedHash: string
    
    if (postId) {
      // Verify by postId
      post = await Post.findById(postId)
      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }
      
      // Recompute canonical hash for the post
      computedHash = computeContentHash({
        content: post.content,
        imageUrls: post.imageUrls || [],
        videoUrls: post.videoUrls || [],
        tags: post.tags || []
      })
      
    } else {
      // Verify by raw content
      computedHash = computeContentHash(content)
      
      // Find post with matching hash
      post = await Post.findOne({ contentHash: computedHash })
    }
    
    const result = {
      match: post ? post.contentHash === computedHash : false,
      proof: post?.onChainProof || null,
      computedHash,
      storedHash: post?.contentHash || null,
      imprintStatus: post?.imprintStatus || null
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Verification endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
