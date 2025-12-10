/**
 * DEPRECATED: Use lib/ai/gemini-public-service.ts instead
 * This file is kept for backward compatibility only
 */
import { geminiPublicService } from '../ai/gemini-public-service'

export class AIService {

  async summarizePost(content: string): Promise<string> {
    return geminiPublicService.summarizePost(content)
  }

  async explainPost(content: string): Promise<string> {
    return geminiPublicService.explainPost(content)
  }

  async transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
    return geminiPublicService.transcribeAudio(audioBase64, mimeType)
  }

  async analyzeImage(imageBase64: string, mimeType: string): Promise<string> {
    return geminiPublicService.analyzeImage(imageBase64, mimeType)
  }

  async describeImage(imageBase64: string, mimeType: string): Promise<string> {
    return geminiPublicService.describeImage(imageBase64, mimeType)
  }

  async enhanceText(content: string, instruction: string): Promise<string> {
    return geminiPublicService.enhanceText(content, instruction)
  }

  async generateSearchKeywords(query: string): Promise<string[]> {
    return geminiPublicService.generateSearchKeywords(query)
  }

  async summarizeSearchResults(query: string, results: unknown[]): Promise<string> {
    return geminiPublicService.summarizeSearchResults(query, results)
  }

  async semanticSearch(query: string, posts: unknown[]): Promise<unknown[]> {
    return geminiPublicService.semanticSearch(query, posts)
  }

  /**
   * @deprecated Use mistralBackgroundService.analyzeQuality() instead
   * This method is kept for backward compatibility
   */
  async analyzeContentQuality(content: string): Promise<{
    score: number;
    xpBonus: number;
    category: string;
    reasoning: string;
  }> {
    console.warn('AIService.analyzeContentQuality is deprecated. Use mistralBackgroundService.analyzeQuality() instead')
    const { mistralBackgroundService } = await import('../ai/mistral-background-service')
    return mistralBackgroundService.analyzeQuality(content)
  }
}

export const aiService = new AIService();