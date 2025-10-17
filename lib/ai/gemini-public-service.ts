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

class GeminiPublicService {
  private genAI: GoogleGenerativeAI
  private model = 'gemini-2.5-flash'

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
      console.error('Gemini summarization failed:', error)
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
      console.error('Gemini explanation failed:', error)
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
      console.error('Gemini transcription failed:', error)
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
      console.error('Gemini image analysis failed:', error)
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
      console.error('Gemini image description failed:', error)
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
      console.error('Gemini text enhancement failed:', error)
      return content
    }
  }

  async generateSearchKeywords(query: string): Promise<string[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model })
      const prompt = `Given this search query from a developer: "${query}"

Generate 5-10 related keywords, synonyms, and technical terms that would help find relevant posts.

Examples:
- Query: "how to center a div" → Keywords: ["css", "flexbox", "center", "align", "justify-content", "margin auto", "grid"]
- Query: "react hooks" → Keywords: ["react", "hooks", "useState", "useEffect", "functional components", "state management"]

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
      
      return [query]
    } catch (error) {
      console.error('Gemini keyword generation failed:', error)
      return [query]
    }
  }

  async summarizeSearchResults(query: string, results: any[]): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model })
      const resultsText = results.slice(0, 5).map((r, i) => 
        `${i + 1}. ${r.content.substring(0, 200)}...`
      ).join('\n\n')
      
      const prompt = `User searched for: "${query}"

Top results:
${resultsText}

Provide a brief 2-3 sentence summary of what these results are about and how they relate to the search query.`
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text().trim()
    } catch (error) {
      console.error('Gemini search summary failed:', error)
      return ''
    }
  }

  async semanticSearch(query: string, posts: any[]): Promise<any[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model })
      
      const postsText = posts.map((p, i) => 
        `[${i}] ${p.content.substring(0, 300)}`
      ).join('\n\n')
      
      const prompt = `User query: "${query}"

Posts:
${postsText}

Rank these posts by relevance to the query. Consider:
- Semantic meaning (not just keyword matching)
- Context and intent
- Helpfulness for the query

Return ONLY a JSON array of post indices in order of relevance (most relevant first).
Format: [2, 0, 5, 1, ...]
Include only relevant posts (minimum 3/10 relevance).`
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text().trim()
      
      const jsonMatch = text.match(/\[[\s\S]*?\]/)
      if (jsonMatch) {
        const indices = JSON.parse(jsonMatch[0])
        return indices.map((i: number) => posts[i]).filter(Boolean)
      }
      
      return posts
    } catch (error) {
      console.error('Gemini semantic search failed:', error)
      return posts
    }
  }
}

export const geminiPublicService = new GeminiPublicService()
