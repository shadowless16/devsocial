// lib/ai-service.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

interface GeminiResponse {
  response: {
    text: () => string;
  };
}

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.model = 'gemini-2.5-flash';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async summarizePost(content: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      const prompt = `You are a helpful assistant that creates concise summaries of social media posts. Keep summaries under 100 characters and capture the main point.\n\nSummarize this post: ${content}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim() || 'Summary unavailable';
    } catch (error) {
      console.error('AI summarization failed:', error);
      return 'Summary unavailable';
    }
  }

  async explainPost(content: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      const prompt = `You are a helpful assistant that explains social media posts in a clear, educational way. Provide context, clarify technical terms, and make the content more accessible. Keep explanations under 200 words.\n\nExplain this post in detail: ${content}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim() || 'Explanation unavailable';
    } catch (error) {
      console.error('AI explanation failed:', error);
      return 'Explanation unavailable';
    }
  }

  async transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      
      const result = await model.generateContent([
        {
          inlineData: {
            data: audioBase64,
            mimeType: mimeType
          }
        },
        'Transcribe this audio accurately. Only return the transcribed text, nothing else.'
      ]);
      
      const response = await result.response;
      return response.text().trim() || 'Transcription unavailable';
    } catch (error) {
      console.error('Audio transcription failed:', error);
      return 'Transcription unavailable';
    }
  }

  async analyzeImage(imageBase64: string, mimeType: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      
      const result = await model.generateContent([
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType
          }
        },
        'Analyze this image and provide: 1) A description of what you see, 2) Any text visible in the image (OCR), 3) Context or explanation if relevant. Keep it under 200 words.'
      ]);
      
      const response = await result.response;
      return response.text().trim() || 'Analysis unavailable';
    } catch (error) {
      console.error('Image analysis failed:', error);
      return 'Analysis unavailable';
    }
  }

  async describeImage(imageBase64: string, mimeType: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      
      const result = await model.generateContent([
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType
          }
        },
        'Provide a brief, accessible description of this image in one sentence for alt text purposes.'
      ]);
      
      const response = await result.response;
      return response.text().trim() || 'Image description unavailable';
    } catch (error) {
      console.error('Image description failed:', error);
      return 'Image description unavailable';
    }
  }
}

export const aiService = new AIService();