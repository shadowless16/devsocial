import dbConnect from './db';
import BotAccount from '@/models/BotAccount';
import BotActivity from '@/models/BotActivity';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { generateComment, generateReply } from './ai-comment-generator';

export async function runBotEngagement() {
  await dbConnect();
  
  const activeBots = await BotAccount.find({ isActive: true }).populate('userId');
  
  for (const bot of activeBots) {
    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('author');
    
    const postsToEngage = recentPosts.slice(0, bot.commentFrequency);
    
    for (const post of postsToEngage) {
      const hasCommented = await BotActivity.findOne({ 
        botAccountId: bot._id, 
        postId: post._id 
      });
      
      if (!hasCommented) {
        await commentOnPost(bot, post);
      } else {
        const shouldReply = Math.random() > 0.5;
        if (shouldReply) {
          await replyToComment(bot, post);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    bot.lastActive = new Date();
    await bot.save();
  }
}

async function commentOnPost(bot: any, post: any) {
  const existingComments = await Comment.find({ post: post._id }).limit(5);
  const existingTexts = existingComments.map(c => c.content);
  
  const commentText = await generateComment({
    postContent: post.content,
    personality: bot.personality,
    existingComments: existingTexts
  });
  
  const comment = new Comment({
    content: commentText,
    author: bot.userId._id,
    post: post._id
  });
  await comment.save();
  await comment.populate('author', 'username displayName avatar level gender');
  
  await Post.findByIdAndUpdate(post._id, { $inc: { commentsCount: 1 } });
  
  await BotActivity.create({
    botAccountId: bot._id,
    postId: post._id,
    commentId: comment._id,
    action: 'comment',
    content: commentText
  });
  
  bot.stats.totalComments += 1;
  await bot.save();
  
  await User.findByIdAndUpdate(bot.userId._id, { $inc: { points: 5 } });
}

async function replyToComment(bot: any, post: any) {
  const comments = await Comment.find({ post: post._id }).populate('author');
  
  const otherComments = comments.filter(c => c.author._id.toString() !== bot.userId._id.toString());
  
  if (otherComments.length === 0) return;
  
  const randomComment = otherComments[Math.floor(Math.random() * otherComments.length)];
  
  const replyText = await generateReply({
    postContent: post.content,
    commentToReplyTo: randomComment.content,
    personality: bot.personality
  });
  
  const reply = new Comment({
    content: replyText,
    author: bot.userId._id,
    post: post._id,
    parentComment: randomComment._id
  });
  await reply.save();
  await reply.populate('author', 'username displayName avatar level gender');
  
  await Post.findByIdAndUpdate(post._id, { $inc: { commentsCount: 1 } });
  
  await BotActivity.create({
    botAccountId: bot._id,
    postId: post._id,
    commentId: reply._id,
    action: 'reply',
    content: replyText
  });
  
  bot.stats.totalReplies += 1;
  await bot.save();
  
  await User.findByIdAndUpdate(bot.userId._id, { $inc: { points: 5 } });
}
