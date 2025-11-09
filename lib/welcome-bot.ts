import User from '@/models/User'
import Post from '@/models/Post'
import Comment from '@/models/Comment'
import { connectWithRetry } from '@/lib/connect-with-retry'

const BOT_USERNAME = 'welcomebot'
const BOT_EMAIL = 'welcomebot@devsocial.dev'

export async function getOrCreateWelcomeBot() {
  await connectWithRetry()
  
  let bot = await User.findOne({ username: BOT_USERNAME })
  
  if (!bot) {
    bot = await User.create({
      username: BOT_USERNAME,
      email: BOT_EMAIL,
      password: Math.random().toString(36),
      displayName: 'Welcome Bot',
      bio: 'Official DevSocial bot welcoming new members 🤖',
      role: 'user',
      isVerified: true,
      avatar: '',
      level: 100,
      points: 100000,
      badges: ['bot', 'verified'],
    })
  }
  
  return bot
}

export async function isFirstPost(userId: string): Promise<boolean> {
  const postCount = await Post.countDocuments({ author: userId })
  return postCount === 1
}

export async function createWelcomeComment(postId: string, authorId: string, authorName: string) {
  try {
    const bot = await getOrCreateWelcomeBot()
    
    const welcomeMessages = [
      `Nice first post, ${authorName}! 🎉 Welcome to DevSocial!`,
      `Welcome to the community, ${authorName}! 🎉 Great first post!`,
      `Awesome first post, ${authorName}! 🎉 Excited to see more from you!`,
      `Hey ${authorName}! 🎉 Welcome aboard! Great way to start!`,
    ]
    
    const message = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
    
    const comment = await Comment.create({
      author: bot._id,
      post: postId,
      content: message,
      likesCount: 0,
    })
    
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } })
    
    return comment
  } catch (error) {
    console.error('Welcome bot comment failed:', error)
    return null
  }
}
