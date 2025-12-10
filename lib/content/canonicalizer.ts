import crypto from 'crypto'
import { IPost } from '@/models/Post'

export function canonicalizePost(post: IPost): string {
  const canonical = {
    authorId: post.author.toString(),
    content: post.content.trim(),
    contentType: determineContentType(post),
    createdAt: post.createdAt.toISOString(),
    metadata: {
      hasMedia: hasMedia(post),
      mediaCount: getMediaCount(post),
      tags: (post.tags || []).sort()
    },
    postId: (post._id as { toString: () => string }).toString()
  }

  return JSON.stringify(canonical)
}

export function hashPost(post: IPost): string {
  const canonicalJson = canonicalizePost(post)
  return crypto.createHash('sha256').update(canonicalJson, 'utf8').digest('hex')
}

function determineContentType(post: IPost): string {
  const hasImages = (post.imageUrls && post.imageUrls.length > 0) || post.imageUrl
  const hasVideos = post.videoUrls && post.videoUrls.length > 0
  
  if (hasImages && hasVideos) return 'mixed'
  if (hasImages) return 'image'
  if (hasVideos) return 'video'
  return 'text'
}

function hasMedia(post: IPost): boolean {
  return !!(post.imageUrls?.length || post.imageUrl || post.videoUrls?.length)
}

function getMediaCount(post: IPost): number {
  let count = 0
  if (post.imageUrl) count++
  if (post.imageUrls) count += post.imageUrls.length
  if (post.videoUrls) count += post.videoUrls.length
  return count
}