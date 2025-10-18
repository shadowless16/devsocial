import { Mistral } from '@mistralai/mistralai';

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY || '' });

interface CommentOptions {
  postContent: string;
  personality: 'friendly' | 'technical' | 'casual' | 'professional';
  existingComments?: string[];
}

interface ReplyOptions {
  postContent: string;
  commentToReplyTo: string;
  personality: 'friendly' | 'technical' | 'casual' | 'professional';
}

export async function generateComment({ postContent, personality, existingComments = [] }: CommentOptions): Promise<string> {
  const personalityPrompts = {
    friendly: 'Be warm, encouraging, and supportive. Use emojis occasionally.',
    technical: 'Be analytical and technical. Focus on details and accuracy.',
    casual: 'Be relaxed and conversational. Keep it short and natural.',
    professional: 'Be polished and respectful. Provide thoughtful insights.'
  };

  const prompt = `You are commenting on a social media post. ${personalityPrompts[personality]}

Post: "${postContent}"

${existingComments.length > 0 ? `Existing comments: ${existingComments.join(', ')}` : ''}

Generate a natural, engaging comment (1-2 sentences max). Make it feel human and relevant. Don't repeat existing comments.`;

  const result = await mistral.chat.complete({
    model: 'mistral-small-latest',
    messages: [{ role: 'user', content: prompt }]
  });
  
  const content = result.choices?.[0]?.message?.content;
  return typeof content === 'string' ? content.trim() : '';
}

export async function generateReply({ postContent, commentToReplyTo, personality }: ReplyOptions): Promise<string> {
  const personalityPrompts = {
    friendly: 'Be warm and conversational.',
    technical: 'Be precise and informative.',
    casual: 'Be chill and brief.',
    professional: 'Be respectful and thoughtful.'
  };

  const prompt = `You are replying to a comment on a post. ${personalityPrompts[personality]}

Original Post: "${postContent}"
Comment to reply to: "${commentToReplyTo}"

Generate a natural reply (1 sentence). Make it conversational and relevant.`;

  const result = await mistral.chat.complete({
    model: 'mistral-small-latest',
    messages: [{ role: 'user', content: prompt }]
  });
  
  const content = result.choices?.[0]?.message?.content;
  return typeof content === 'string' ? content.trim() : '';
}
