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
    friendly: 'warm and supportive',
    technical: 'smart and analytical',
    casual: 'super chill and relaxed',
    professional: 'respectful and thoughtful'
  };

  const prompt = `Post: "${postContent}"

Write ONE short comment (1 sentence max). Be ${personalityPrompts[personality]}. Write ONLY the comment text - no quotes, no options, no explanations. Just the comment itself.`;

  const result = await mistral.chat.complete({
    model: 'mistral-small-latest',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.9,
    maxTokens: 50
  });
  
  const content = result.choices?.[0]?.message?.content;
  let text = typeof content === 'string' ? content.trim() : '';
  
  text = text.replace(/^["']|["']$/g, '');
  text = text.replace(/\(Or,.*?\)/gi, '');
  text = text.replace(/\(.*?\)/g, '');
  
  return text.trim();
}

export async function generateReply({ postContent, commentToReplyTo, personality }: ReplyOptions): Promise<string> {
  const personalityPrompts = {
    friendly: 'warm',
    technical: 'smart',
    casual: 'chill',
    professional: 'respectful'
  };

  const prompt = `Someone said: "${commentToReplyTo}"

Reply in 1 short sentence. Be ${personalityPrompts[personality]}. Write ONLY your reply - no quotes, no options.`;

  const result = await mistral.chat.complete({
    model: 'mistral-small-latest',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.9,
    maxTokens: 40
  });
  
  const content = result.choices?.[0]?.message?.content;
  let text = typeof content === 'string' ? content.trim() : '';
  
  text = text.replace(/^["']|["']$/g, '');
  text = text.replace(/\(Or,.*?\)/gi, '');
  text = text.replace(/\(.*?\)/g, '');
  
  return text.trim();
}
