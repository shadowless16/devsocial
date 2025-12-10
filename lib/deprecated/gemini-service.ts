/**
 * DEPRECATED: Use lib/ai/gemini-public-service.ts instead
 * This file is kept for backward compatibility only
 */
import { geminiPublicService } from '../ai/gemini-public-service'

export interface SemanticSearchResult {
  relevanceScore: number
  summary: string
  keywords: string[]
}

export async function analyzeSearchQuery(query: string): Promise<{
  intent: string
  keywords: string[]
  expandedQuery: string
}> {
  const keywords = await geminiPublicService.generateSearchKeywords(query)
  return {
    intent: query,
    keywords,
    expandedQuery: keywords.join(' ')
  }
}

export async function rankSearchResults(
  query: string,
  results: unknown[]
): Promise<unknown[]> {
  if (results.length === 0) return []
  return geminiPublicService.semanticSearch(query, results)
}

export async function generateSearchSummary(
  query: string,
  results: { posts: unknown[]; users: unknown[]; tags: unknown[] }
): Promise<string> {
  if (results.posts.length === 0) {
    return `Found ${results.users.length} users and ${results.tags.length} tags matching "${query}".`
  }
  return geminiPublicService.summarizeSearchResults(query, results.posts)
}
