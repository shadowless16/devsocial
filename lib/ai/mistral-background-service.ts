/**
 * MISTRAL AI - BACKGROUND SERVICE
 * 
 * Purpose: Handles all behind-the-scenes AI tasks
 * - Content moderation (toxic/spam detection)
 * - Badge condition validation
 * - Post quality scoring for XP bonuses
 * - Automated content analysis
 * 
 * DO NOT use this for user-facing features
 * Use gemini-public-service.ts for user interactions
 */

import { Mistral } from '@mistralai/mistralai'
import { logAIAction } from './ai-logger'

interface ModerationResult {
  isSafe: boolean
  isSpam: boolean
  isToxic: boolean
  confidence: number
  reason: string
  suggestedAction: 'approve' | 'flag' | 'auto-remove'
}

interface QualityAnalysis {
  score: number
  xpBonus: number
  category: 'helpful' | 'tutorial' | 'discussion' | 'question' | 'showcase' | 'low-quality' | 'spam'
  reasoning: string
  hasCode: boolean
  isEducational: boolean
}

interface BadgeConditionCheck {
  eligible: boolean
  confidence: number
  reasoning: string
  suggestedBadge?: string
}

class MistralBackgroundService {
  private client: any
  private model = 'mistral-small-latest'

  constructor() {
    const apiKey = process.env.MISTRAL_API_KEY
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY is required for background AI service')
    }
    this.client = new Mistral({ apiKey })
  }

  /**
   * CONTENT MODERATION
   * Checks if content is safe, spam-free, and appropriate
   */
  async moderateContent(content: string): Promise<ModerationResult> {
    const startTime = Date.now()
    try {
      const prompt = `You are a content moderator for a developer social platform. Analyze this post:

"${content}"

Check for:
1. Toxic/offensive language
2. Spam or promotional content
3. Inappropriate content
4. Harassment or hate speech

Respond ONLY with JSON:
{
  "isSafe": boolean,
  "isSpam": boolean,
  "isToxic": boolean,
  "confidence": 0-100,
  "reason": "brief explanation",
  "suggestedAction": "approve" | "flag" | "auto-remove"
}`

      const response = await this.client.chat.complete({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        maxTokens: 200
      })

      const text = response.choices?.[0]?.message?.content || '{}'
      const result = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))

      const moderationResult = {
        isSafe: result.isSafe ?? true,
        isSpam: result.isSpam ?? false,
        isToxic: result.isToxic ?? false,
        confidence: result.confidence ?? 50,
        reason: result.reason || 'No issues detected',
        suggestedAction: result.suggestedAction || 'approve'
      }

      await logAIAction({
        service: 'mistral',
        aiModel: this.model,
        taskType: 'moderation',
        inputLength: content.length,
        outputSummary: `${moderationResult.suggestedAction} (${moderationResult.confidence}% confidence)`,
        success: true,
        executionTime: Date.now() - startTime
      })

      return moderationResult
    } catch (error) {
      console.error('Mistral moderation failed:', error)
      await logAIAction({
        service: 'mistral',
        aiModel: this.model,
        taskType: 'moderation',
        inputLength: content.length,
        outputSummary: 'Failed',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      })
      return {
        isSafe: true,
        isSpam: false,
        isToxic: false,
        confidence: 0,
        reason: 'Moderation unavailable',
        suggestedAction: 'approve'
      }
    }
  }

  /**
   * QUALITY ANALYSIS
   * Scores content quality and determines XP bonus
   */
  async analyzeQuality(content: string): Promise<QualityAnalysis> {
    const startTime = Date.now()
    try {
      const prompt = `Analyze this developer post for quality:

"${content}"

Rate based on:
- Technical accuracy and depth
- Helpfulness to other developers
- Code examples or technical details
- Educational value
- Clarity and structure

Respond ONLY with JSON:
{
  "score": 1-10,
  "xpBonus": 0-50,
  "category": "helpful|tutorial|discussion|question|showcase|low-quality|spam",
  "reasoning": "brief explanation (max 50 words)",
  "hasCode": boolean,
  "isEducational": boolean
}

XP Bonus Guide:
- 0-5: Low quality/spam
- 10-15: Standard helpful post
- 20-30: Very helpful with code/examples
- 35-45: Excellent tutorial/guide
- 50: Exceptional educational content`

      const response = await this.client.chat.complete({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        maxTokens: 250
      })

      const text = response.choices?.[0]?.message?.content || '{}'
      const result = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))

      const qualityResult = {
        score: Math.min(10, Math.max(1, result.score || 5)),
        xpBonus: Math.min(50, Math.max(0, result.xpBonus || 10)),
        category: result.category || 'discussion',
        reasoning: result.reasoning || 'Standard post',
        hasCode: result.hasCode ?? false,
        isEducational: result.isEducational ?? false
      }

      await logAIAction({
        service: 'mistral',
        aiModel: this.model,
        taskType: 'quality_analysis',
        inputLength: content.length,
        outputSummary: `${qualityResult.category} (score: ${qualityResult.score}, xp: ${qualityResult.xpBonus})`,
        success: true,
        executionTime: Date.now() - startTime
      })

      return qualityResult
    } catch (error) {
      console.error('Mistral quality analysis failed:', error)
      await logAIAction({
        service: 'mistral',
        aiModel: this.model,
        taskType: 'quality_analysis',
        inputLength: content.length,
        outputSummary: 'Failed',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      })
      return {
        score: 5,
        xpBonus: 10,
        category: 'discussion',
        reasoning: 'Analysis unavailable',
        hasCode: false,
        isEducational: false
      }
    }
  }

  /**
   * BADGE CONDITION CHECKER
   * Validates if user meets badge requirements
   */
  async checkBadgeCondition(
    badgeName: string,
    condition: string,
    userContent: string[]
  ): Promise<BadgeConditionCheck> {
    try {
      const prompt = `Check if user qualifies for badge: "${badgeName}"

Condition: ${condition}

Recent user content:
${userContent.slice(0, 5).join('\n---\n')}

Analyze if they meet the badge requirements.

Respond ONLY with JSON:
{
  "eligible": boolean,
  "confidence": 0-100,
  "reasoning": "why they qualify or don't",
  "suggestedBadge": "alternative badge if not eligible (optional)"
}`

      const response = await this.client.chat.complete({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        maxTokens: 200
      })

      const text = response.choices?.[0]?.message?.content || '{}'
      const result = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))

      return {
        eligible: result.eligible ?? false,
        confidence: result.confidence ?? 50,
        reasoning: result.reasoning || 'Unable to determine',
        suggestedBadge: result.suggestedBadge
      }
    } catch (error) {
      console.error('Mistral badge check failed:', error)
      return {
        eligible: false,
        confidence: 0,
        reasoning: 'Badge check unavailable'
      }
    }
  }

  /**
   * BATCH MODERATION
   * Moderate multiple posts at once (for scheduled jobs)
   */
  async batchModerate(contents: string[]): Promise<ModerationResult[]> {
    const results = await Promise.all(
      contents.map(content => this.moderateContent(content))
    )
    return results
  }

  /**
   * DETECT HELPFUL SOLUTION
   * Checks if a comment is a helpful solution (for XP bonus)
   */
  async isHelpfulSolution(comment: string, originalPost: string): Promise<boolean> {
    try {
      const prompt = `Original question/post:
"${originalPost}"

Comment/reply:
"${comment}"

Is this comment a helpful solution or answer? Consider:
- Does it solve the problem?
- Does it provide code/examples?
- Is it actionable and clear?

Respond ONLY: true or false`

      const response = await this.client.chat.complete({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        maxTokens: 10
      })

      const text = response.choices?.[0]?.message?.content?.toLowerCase() || 'false'
      return text.includes('true')
    } catch (error) {
      console.error('Mistral solution detection failed:', error)
      return false
    }
  }
}

export const mistralBackgroundService = new MistralBackgroundService()
