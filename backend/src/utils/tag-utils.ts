import Tag from "../models/Tag"
import { connectDB } from "../config/database"

export async function findOrCreateTags(tagNames: string[], userId: string) {
  await connectDB()
  
  const tagIds = []
  
  for (const name of tagNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "")
    
    let tag = await Tag.findOne({ slug } as any)
    
    if (!tag) {
      tag = await Tag.create({
        name: name.trim(),
        slug,
        createdBy: userId
      })
    } else {
      // Increment usage count
      await Tag.findByIdAndUpdate(tag._id, { $inc: { usageCount: 1 } } as any)
    }
    
    tagIds.push(tag._id)
  }
  
  return tagIds
}

export function extractHashtags(content: string): string[] {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g
  const matches = content.match(hashtagRegex) || []
  return matches.map(tag => tag.substring(1).toLowerCase()) // Remove # symbol and normalize
}