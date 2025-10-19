import { Mistral } from '@mistralai/mistralai';

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY || '' });

interface CommentOptions {
  postContent: string;
  personality: 'friendly' | 'technical' | 'casual' | 'professional';
  existingComments?: string[];
  useEmojis?: boolean;
}

interface ReplyOptions {
  postContent: string;
  commentToReplyTo: string;
  personality: 'friendly' | 'technical' | 'casual' | 'professional';
  useEmojis?: boolean;
}

export async function generateComment({
  postContent,
  personality,
  existingComments = [],
  useEmojis = true
}: CommentOptions): Promise<string> {
  const personalityPrompts = {
    friendly: 'warm, supportive, and relatable. Use mild Nigerian expressions like “abeg”, “omo”, “no wahala”, or “you sef try”. Avoid deep pidgin.',
    technical: 'smart, slightly playful, and clear. Blend in soft Nigerian tech tone — words like “correct”, “sharp”, or “you sabi work”.',
    casual: 'relaxed, chatty, and cool. Use everyday Nigerian English with light pidgin like “e choke”, “na so”, or “you dey whine me?”. Keep it readable.',
    professional: 'polite, positive, and subtly Nigerian. Add touches like “well done”, “nice one”, or “keep it up”. No heavy slang.'
  };

  const emojiSets = {
    friendly: ['😊', '🔥', '💯', '😅', '🙌', '😎'],
    technical: ['💡', '⚡', '🚀', '👌', '🧠', '👏'],
    casual: ['😂', '😎', '🔥', '🙌', '💯', '😅'],
    professional: ['🤝', '👍', '👏', '✅', '🙌', '💯']
  };

  const emojiPrompt = useEmojis
    ? `Add one emoji from this list that matches tone: ${emojiSets[personality].join(' ')}.`
    : 'Do NOT use any emoji.';

  const prompt = `
Post: "${postContent}"

Write ONE short comment (max 1 sentence).
Tone: ${personalityPrompts[personality]}.
Make it sound naturally Nigerian, not too formal, not too pidgin.
${emojiPrompt}
Write ONLY the comment — no quotes or explanations.
`;

  const result = await mistral.chat.complete({
    model: 'mistral-small-latest',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.85,
    maxTokens: 50
  });

  const content = result.choices?.[0]?.message?.content;
  let text = typeof content === 'string' ? content.trim() : '';

  text = text.replace(/^["']|["']$/g, '');
  text = text.replace(/\(.*?\)/g, '');

  return text.trim();
}

export async function generateReply({
  postContent,
  commentToReplyTo,
  personality,
  useEmojis = true
}: ReplyOptions): Promise<string> {
  const personalityPrompts = {
    friendly: 'warm and cheerful, with a sprinkle of Nigerian flavor. Use soft expressions like “lol”, “no wahala”, or “you get sense”.',
    technical: 'smart and calm. Use Nigerian tech tone — “correct”, “sharp thinking”, or “true talk”.',
    casual: 'cool and relatable, mix light pidgin with Nigerian English — “na true o”, “you sabi this thing”, “omo you get point”.',
    professional: 'respectful, positive, and mildly Nigerian — “well said”, “you try for this one”, “I agree with you”.'
  };

  const emojiSets = {
    friendly: ['😅', '🔥', '💯', '🙌', '😎', '😂'],
    technical: ['💡', '🚀', '👌', '👏', '🧠', '✅'],
    casual: ['😎', '🔥', '😂', '💯', '🙌', '🤣'],
    professional: ['👏', '🤝', '👍', '🙌', '✅', '💯']
  };

  const emojiPrompt = useEmojis
    ? `Add one emoji from this list that fits tone: ${emojiSets[personality].join(' ')}.`
    : 'Do NOT include any emoji.';

  const prompt = `
Someone commented: "${commentToReplyTo}"
Original post: "${postContent}"

Write ONE short reply (max 1 sentence).
Tone: ${personalityPrompts[personality]}.
Make it sound naturally Nigerian, conversational but clear.
${emojiPrompt}
Write ONLY the reply — no quotes or explanations.
`;

  const result = await mistral.chat.complete({
    model: 'mistral-small-latest',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.85,
    maxTokens: 50
  });

  const content = result.choices?.[0]?.message?.content;
  let text = typeof content === 'string' ? content.trim() : '';

  text = text.replace(/^["']|["']$/g, '');
  text = text.replace(/\(.*?\)/g, '');

  return text.trim();
}
