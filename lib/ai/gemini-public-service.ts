/**
 * GEMINI AI - PUBLIC SERVICE
 * 
 * Purpose: Handles all user-facing AI features
 * - Post summarization
 * - Code explanation
 * - Search enhancement
 * - Image analysis
 * - Audio transcription
 * 
 * DO NOT use this for background tasks
 * Use mistral-background-service.ts for automated moderation/analysis
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { geminiRateLimiter } from './rate-limiter'

class GeminiPublicService {
  private genAI: GoogleGenerativeAI
  private model = 'gemini-2.0-flash'

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required for public AI service')
    }
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async summarizePost(content: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model })
      const prompt = `You are a helpful assistant that creates concise summaries of social media posts. Keep summaries under 100 characters and capture the main point.\n\nSummarize this post: ${content}`
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text().trim() || 'Summary unavailable'
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gemini summarization failed'
      console.error('Gemini summarization failed:', errorMessage)
      return 'Summary unavailable'
    }
  }

  async explainPost(content: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model })
      const prompt = `You are a helpful assistant that explains social media posts in a clear, educational way. Provide context, clarify technical terms, and make the content more accessible. Keep explanations under 200 words.\n\nExplain this post in detail: ${content}`
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text().trim() || 'Explanation unavailable'
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gemini explanation failed'
      console.error('Gemini explanation failed:', errorMessage)
      return 'Explanation unavailable'
    }
  }

  async transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model })
      
      const result = await model.generateContent([
        {
          inlineData: {
            data: audioBase64,
            mimeType: mimeType
          }
        },
        'Transcribe this audio accurately. Only return the transcribed text, nothing else.'
      ])
      
      const response = await result.response
      return response.text().trim() || 'Transcription unavailable'
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gemini transcription failed'
      console.error('Gemini transcription failed:', errorMessage)
      return 'Transcription unavailable'
    }
  }

  async analyzeImage(imageBase64: string, mimeType: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model })
      
      const result = await model.generateContent([
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType
          }
        },
        'Analyze this image and provide: 1) A description of what you see, 2) Any text visible in the image (OCR), 3) Context or explanation if relevant. Keep it under 200 words.'
      ])
      
      const response = await result.response
      return response.text().trim() || 'Analysis unavailable'
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gemini image analysis failed'
      console.error('Gemini image analysis failed:', errorMessage)
      return 'Analysis unavailable'
    }
  }

  async describeImage(imageBase64: string, mimeType: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model })
      
      const result = await model.generateContent([
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType
          }
        },
        'Provide a brief, accessible description of this image in one sentence for alt text purposes.'
      ])
      
      const response = await result.response
      return response.text().trim() || 'Image description unavailable'
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gemini image description failed'
      console.error('Gemini image description failed:', errorMessage)
      return 'Image description unavailable'
    }
  }

  async enhanceText(content: string, instruction: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model })
      const prompt = `${instruction}\n\nOriginal text: ${content}`
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text().trim() || content
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gemini text enhancement failed'
      console.error('Gemini text enhancement failed:', errorMessage)
      return content
    }
  }

  async generateSearchKeywords(query: string): Promise<string[]> {
    try {
      if (!geminiRateLimiter.canMakeRequest()) {
        console.warn('Rate limit reached, using basic keywords')
        return query.toLowerCase().split(/\s+/).filter(Boolean)
      }
      geminiRateLimiter.recordRequest()
      
      const model = this.genAI.getGenerativeModel({ model: this.model })
      const prompt = `You are a search keyword expander for a developer social platform.

User's search query: "${query}"

Generate 5-10 highly relevant keywords, synonyms, and technical terms that would help find posts related to this query.

Examples:
- Query: "how to center a div" → ["css", "flexbox", "center", "align", "justify-content", "margin", "grid", "centering", "layout"]
- Query: "react hooks" → ["react", "hooks", "useState", "useEffect", "functional", "components", "state"]
- Query: "weekend activities" → ["weekend", "activities", "hobby", "free time", "leisure", "fun"]

IMPORTANT: 
- Include the original query terms
- Add related technical terms if it's a technical query
- Add synonyms and variations
- Keep keywords relevant to the actual query intent

Return ONLY a JSON array of keywords, no other text.
Format: ["keyword1", "keyword2", ...]`
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text().trim()
      
      const jsonMatch = text.match(/\[[\s\S]*?\]/)
      if (jsonMatch) {
        const keywords = JSON.parse(jsonMatch[0])
        return keywords.slice(0, 10)
      }
      
      return query.toLowerCase().split(/\s+/).filter(Boolean)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gemini keyword generation failed'
      console.error('Gemini keyword generation failed:', errorMessage)
      return query.toLowerCase().split(/\s+/).filter(Boolean)
    }
  }

  async summarizeSearchResults(query: string, results: Array<Record<string, unknown>>): Promise<string> {
    try {
      if (!results || results.length === 0) return ''
      
      if (!geminiRateLimiter.canMakeRequest()) {
        return `Found ${results.length} results matching "${query}".`
      }
      geminiRateLimiter.recordRequest()
      
      const model = this.genAI.getGenerativeModel({ model: this.model })
      const resultsText = results.slice(0, 5)
        .filter((r): r is { content?: string } => typeof r === 'object' && r !== null && 'content' in r && typeof (r as { content?: unknown }).content === 'string')
        .map((r, i) => 
          `${i + 1}. ${r.content!.substring(0, 300)}...`
        ).join('\n\n')
      
      if (!resultsText) return ''
      
      const prompt = `You are analyzing search results for a developer social platform.

User's search query: "${query}"

Top search results found:
${resultsText}

Analyze these results and provide a 2-3 sentence summary that:
1. Explains what topics/themes these posts cover
2. States clearly whether they are relevant to the search query "${query}"
3. If relevant, explain HOW they relate to the query
4. If NOT relevant, explain what they're actually about instead

Be honest and direct. If the results don't match the query, say so clearly.`
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text().trim()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gemini search summary failed'
      console.error('Gemini search summary failed:', errorMessage)
      const status = typeof error === 'object' && error !== null && 'status' in error ? (error as { status: number }).status : 0
      if (status === 429) {
        return 'AI summary temporarily unavailable due to rate limits. Please try again in a moment.'
      }
      return ''
    }
  }

  async semanticSearch(query: string, posts: Array<Record<string, unknown>>): Promise<Array<Record<string, unknown>>> {
    try {
      if (!posts || posts.length === 0) return []
      
      const validPosts = posts.filter((p): p is { content?: string } => typeof p === 'object' && p !== null && 'content' in p)
      if (validPosts.length === 0) return posts
      
      if (!geminiRateLimiter.canMakeRequest()) {
        console.warn('Rate limit reached, skipping AI ranking')
        return validPosts
      }
      geminiRateLimiter.recordRequest()
      
      const model = this.genAI.getGenerativeModel({ model: this.model })
      
      const postsText = validPosts.map((p, i) => 
        `[${i}] ${typeof p === 'object' && p !== null && 'content' in p && typeof (p as { content?: string }).content === 'string' ? (p as { content: string }).content.substring(0, 300) : ''}`
      ).join('\n\n')
      
      const prompt = `You are a search relevance analyzer for a developer social platform.

User's search query: "${query}"

Available posts:
${postsText}

Analyze each post and rank them by relevance to the query "${query}".

Consider:
- Does the post directly answer or relate to the query?
- Semantic meaning and context (not just keyword matching)
- Actual helpfulness for someone searching "${query}"

IMPORTANT: Only include posts that are actually relevant (minimum 30% relevance).
If a post is about something completely different, exclude it.

Return ONLY a JSON array of relevant post indices in order (most relevant first).
Format: [2, 0, 5]
If NO posts are relevant, return an empty array: []`
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text().trim()
      
      const jsonMatch = text.match(/\[[\s\S]*?\]/)
      if (jsonMatch) {
        const indices = JSON.parse(jsonMatch[0])
        const rankedPosts = indices.map((i: number) => validPosts[i]).filter(Boolean)
        return rankedPosts.length > 0 ? rankedPosts : validPosts.slice(0, 3)
      }
      
      return validPosts
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gemini semantic search failed'
      console.error('Gemini semantic search failed:', errorMessage)
      const status = typeof error === 'object' && error !== null && 'status' in error ? (error as { status: number }).status : 0
      if (status === 429) {
        console.warn('Gemini rate limit exceeded, returning posts without AI ranking')
      }
      return posts
    }
  }
}

export const geminiPublicService = new GeminiPublicService()
