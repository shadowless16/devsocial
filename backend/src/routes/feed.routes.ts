import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { FeedAlgorithm } = await import('../utils/feed-algorithm');
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const algorithm = (req.query.algorithm as 'chronological' | 'engagement' | 'personalized') || 'personalized';

    const feedData = await FeedAlgorithm.generateFeed({
      userId: req.user!.id,
      page,
      limit,
      algorithm,
    });

    res.json({ success: true, data: feedData });
  } catch (error) {
    console.error('Feed generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate feed' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { FeedAlgorithm } = await import('../utils/feed-algorithm');
    const { type, postId, duration } = req.body;

    await FeedAlgorithm.updateUserPreferences(req.user!.id, { type, postId, duration });

    res.json({ success: true, data: { message: 'Interaction recorded' } });
  } catch (error) {
    console.error('Interaction tracking error:', error);
    res.status(500).json({ success: false, error: 'Failed to track interaction' });
  }
});

export default router;
