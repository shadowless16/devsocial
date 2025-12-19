import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { Tag } = await import('../models');
    const search = req.query.search as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const popular = req.query.popular === 'true';

    let query = {};
    if (search) {
      query = { name: { $regex: search, $options: 'i' } };
    }

    const tags = await Tag.find(query)
      .sort(popular ? { usageCount: -1 } : { createdAt: -1 })
      .limit(limit)
      .populate('createdBy', 'username');

    res.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { Tag } = await import('../models');
    const { name, description, color } = req.body;
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const existingTag = await Tag.findOne({ slug });
    if (existingTag) {
      return res.status(400).json({ error: 'Tag already exists' });
    }

    const tag = await Tag.create({
      name,
      slug,
      description,
      color: color || '#3b82f6',
      createdBy: req.user!.id
    });

    res.status(201).json({ tag });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
