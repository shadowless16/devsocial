import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// GET /api/comments/:postId - Get comments for a post
router.get('/:postId', async (req: Request, res: Response) => {
  try {
    const { Comment, Post } = await import('../models');
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ post: postId, parentComment: { $exists: false } })
      .populate('author', 'username displayName avatar level gender')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('author', 'username displayName avatar level gender')
          .sort({ createdAt: 1 });
        
        return {
          ...comment.toObject(),
          likesCount: comment.likesCount || comment.likes?.length || 0,
          replies: replies.map(reply => ({
            ...reply.toObject(),
            likesCount: reply.likesCount || reply.likes?.length || 0
          })),
          repliesCount: replies.length
        };
      })
    );

    const totalComments = await Comment.countDocuments({ post: postId, parentComment: { $exists: false } });

    res.json({
      success: true,
      data: {
        comments: commentsWithReplies,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalComments / limit),
          totalComments,
          hasMore: skip + comments.length < totalComments,
        },
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch comments' });
  }
});

// POST /api/comments/:postId - Create comment
router.post('/:postId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { Comment, Post, Activity, Notification } = await import('../models');
    const { awardXP } = await import('../utils/awardXP');
    
    const userId = req.user!.id;
    const { postId } = req.params;
    const { content, parentCommentId, imageUrl } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Comment content is required' });
    }

    if (content.length > 500) {
      return res.status(400).json({ success: false, error: 'Comment is too long' });
    }

    const post = await Post.findById(postId).populate('author', 'username displayName');
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const comment = new Comment({
      author: userId,
      post: postId,
      content: content.trim(),
      imageUrl: imageUrl || undefined,
      parentComment: parentCommentId
    });

    await comment.save();
    await comment.populate('author', 'username displayName avatar level gender');

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
    await awardXP(userId, 'comment_creation', comment._id.toString());

    const activity = new Activity({
      user: userId,
      type: 'comment_created',
      description: 'Commented on a post',
      metadata: {
        postId,
        commentId: comment._id,
        postTitle: post.content.substring(0, 50),
      },
      xpEarned: 10,
    });
    await activity.save();

    if (post.author._id.toString() !== userId) {
      const notification = new Notification({
        recipient: post.author._id,
        sender: userId,
        type: 'comment',
        title: `${req.user!.displayName} commented on your post`,
        message: content.substring(0, 100),
        actionUrl: `/post/${postId}`,
        data: { postId, commentId: comment._id },
      });
      await notification.save();
    }

    res.status(201).json({ success: true, data: { comment } });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ success: false, error: 'Failed to create comment' });
  }
});

// DELETE /api/comments/:commentId - Delete comment
router.delete('/:commentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { Comment, Post } = await import('../models');
    const userId = req.user!.id;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    if (comment.author.toString() !== userId && !['admin', 'moderator'].includes(req.user!.role || '')) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
    await Comment.findByIdAndDelete(commentId);

    res.json({ success: true, data: { message: 'Comment deleted successfully' } });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, error: 'Failed to delete comment' });
  }
});

export default router;
