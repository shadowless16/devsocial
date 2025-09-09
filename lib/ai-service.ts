// lib/ai-service.ts
interface MistralResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class AIService {
  private apiKey: string;
  private apiBase: string;

  constructor() {
    this.apiKey = process.env.MISTRAL_API_KEY || '';
    this.apiBase = process.env.MISTRAL_API_BASE || 'https://api.mistral.ai';
    
    if (!this.apiKey) {
      throw new Error('MISTRAL_API_KEY is required');
    }
  }

  async summarizePost(content: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiBase}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that creates concise summaries of social media posts. Keep summaries under 100 characters and capture the main point.'
            },
            {
              role: 'user',
              content: `Summarize this post: ${content}`
            }
          ],
          max_tokens: 200,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data: MistralResponse = await response.json();
      return data.choices[0]?.message?.content?.trim() || 'Summary unavailable';
    } catch (error) {
      console.error('AI summarization failed:', error);
      return 'Summary unavailable';
    }
  }

  async explainPost(content: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiBase}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that explains social media posts in a clear, educational way. Provide context, clarify technical terms, and make the content more accessible. Keep explanations under 200 words.'
            },
            {
              role: 'user',
              content: `Explain this post in detail: ${content}`
            }
          ],
          max_tokens: 400,
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data: MistralResponse = await response.json();
      return data.choices[0]?.message?.content?.trim() || 'Explanation unavailable';
    } catch (error) {
      console.error('AI explanation failed:', error);
      return 'Explanation unavailable';
    }
  }
}

export const aiService = new AIService();