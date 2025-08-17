import crypto from 'crypto'

interface ContentData {
  content: string
  imageUrls?: string[]
  videoUrls?: string[]
  tags?: string[]
}

export function computeContentHash(data: ContentData): string {
  // Create canonical representation for consistent hashing
  const canonical = {
    content: data.content.trim(),
    imageUrls: (data.imageUrls || []).sort(),
    videoUrls: (data.videoUrls || []).sort(), 
    tags: (data.tags || []).sort()
  }
  
  const canonicalString = JSON.stringify(canonical)
  return crypto.createHash('sha256').update(canonicalString).digest('hex')
}