import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { Community } = await import('../models');
    const communities = await Community.find({})
      .populate('creator', 'username displayName avatar')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: communities });
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to fetch communities' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { Community } = await import('../models');
    const userId = req.user!.id;
    const { name, description, category, longDescription, rules } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const community = await Community.create({
      name,
      slug,
      description,
      category,
      longDescription,
      rules: rules?.filter((rule: string) => rule?.trim()) || [],
      creator: userId,
      members: [userId],
      memberCount: 1
    });

    const populatedCommunity = await Community.findById(community._id).populate('creator', 'username displayName avatar');
    
    res.json({ success: true, data: populatedCommunity });
  } catch (error) {
    console.error('Community creation error:', error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to create community' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { Community, Post } = await import('../models');
    const { id } = req.params;
    
    const community = await Community.findById(id)
      .populate('creator', 'username displayName avatar')
      .populate('members', 'username displayName avatar');
    
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    const actualMemberCount = community.members?.length || 0;
    const actualPostCount = await Post.countDocuments({ community: id });
    
    if (community.memberCount !== actualMemberCount || community.postCount !== actualPostCount) {
      await Community.findByIdAndUpdate(id, {
        memberCount: actualMemberCount,
        postCount: actualPostCount
      });
      community.memberCount = actualMemberCount;
      community.postCount = actualPostCount;
    }
    
    res.json({ success: true, data: community });
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to fetch community' });
  }
});

router.post('/:id/join', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { Community } = await import('../models');
    const userId = req.user!.id;
    const { id } = req.params;
    
    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    const isMember = community.members.includes(userId);
    const isCreator = community.creator.toString() === userId;

    if (isCreator && isMember) {
      return res.status(400).json({ 
        success: false, 
        message: 'Community creators cannot leave their own community' 
      });
    }

    if (isMember) {
      community.members = community.members.filter((memberId: any) => memberId.toString() !== userId);
      community.memberCount = Math.max(0, community.memberCount - 1);
    } else {
      community.members.push(userId);
      community.memberCount += 1;
    }

    await community.save();
    
    res.json({ 
      success: true, 
      data: { 
        isJoined: !isMember,
        memberCount: community.memberCount 
      }
    });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to join community' });
  }
});

export default router;
