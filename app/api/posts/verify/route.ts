import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/core/db'
import Post from '@/models/Post'
import { computeContentHash } from '@/lib/content/contentHash'

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
    
    interface PostData {
      content: string;
      imageUrls?: string[];
      videoUrls?: string[];
      tags?: string[];
      contentHash?: string;
      onChainProof?: string;
      imprintStatus?: string;
    }
    
    let post: PostData | null = null
    let computedHash: string
    
    if (postId) {
      // Verify by postId
      const foundPost = await Post.findById(postId)
      if (!foundPost) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }
      post = foundPost as unknown as PostData
      
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
      const foundPost = await Post.findOne({ contentHash: computedHash })
      post = foundPost as unknown as PostData | null
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
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Verification endpoint error:', errorMessage)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
