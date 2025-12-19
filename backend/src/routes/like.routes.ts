import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// POST /api/likes/posts/:postId - Like/unlike post
router.post('/posts/:postId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { Like, Post, Activity, Notification } = await import('../models');
    const { awardXP } = await import('../utils/awardXP');
    
    const userId = req.user!.id;
    const { postId } = req.params;

    const [post, existingLike] = await Promise.all([
      Post.findById(postId).select('author content likesCount').populate('author', 'username displayName'),
      Like.findOne({ user: userId, targetId: postId, targetType: 'post' })
    ]);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    let liked = false;
    let likesCount = post.likesCount;

    if (existingLike) {
      await Promise.all([
        Like.findByIdAndDelete(existingLike._id),
        Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } })
      ]);
      likesCount = Math.max(0, likesCount - 1);
    } else {
      await Promise.all([
        Like.create({ user: userId, targetId: postId, targetType: 'post' }),
        Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } })
      ]);
      likesCount += 1;
      liked = true;

      setImmediate(async () => {
        try {
          await Promise.all([
            awardXP(userId, 'like_given'),
            Activity.create({
              user: userId,
              type: 'like_given',
              description: 'Liked a post',
              metadata: {
                postId,
                postTitle: post.content.substring(0, 50),
              },
              xpEarned: 5,
            })
          ]);

          if (post.author._id.toString() !== userId) {
            await Notification.create({
              recipient: post.author._id,
              sender: userId,
              type: 'like',
              title: `${req.user!.username} liked your post`,
              message: post.content.substring(0, 100),
              actionUrl: `/post/${postId}`,
              data: { postId },
            });
          }
        } catch (bgError) {
          console.warn('Background task failed:', bgError);
        }
      });
    }

    res.json({ success: true, data: { liked, likesCount } });
  } catch (error) {
    console.error('Error toggling post like:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle like' });
  }
});

// POST /api/likes/comments/:commentId - Like/unlike comment
router.post('/comments/:commentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { Like, Comment } = await import('../models');
    
    const userId = req.user!.id;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    const existingLike = await Like.findOne({ user: userId, targetId: commentId, targetType: 'comment' });

    let liked = false;
    let likesCount = await Like.countDocuments({ targetId: commentId, targetType: 'comment' });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      likesCount = Math.max(0, likesCount - 1);
    } else {
      await Like.create({
        user: userId,
        targetId: commentId,
        targetType: 'comment'
      });
      likesCount += 1;
      liked = true;
    }

    res.json({ success: true, data: { liked, likesCount } });
  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle like' });
  }
});

export default router;
