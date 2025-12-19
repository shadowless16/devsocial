import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { User, Post } = await import('../models');
    const query = req.query.q as string;
    const type = (req.query.type as string) || 'all';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const searchRegex = new RegExp(query.trim(), 'i');
    const results: { posts: unknown[]; users: unknown[]; tags: unknown[] } = {
      posts: [],
      users: [],
      tags: [],
    };

    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({ content: searchRegex })
        .populate('author', 'username displayName avatar level')
        .populate('tags', 'name')
        .sort({ createdAt: -1 })
        .skip(type === 'posts' ? skip : 0)
        .limit(type === 'posts' ? limit : 10);

      results.posts = posts.map(post => ({
        ...post.toObject(),
        id: post._id.toString()
      }));
    }

    if (type === 'all' || type === 'users') {
      const users = await User.find({
        $or: [{ username: searchRegex }, { displayName: searchRegex }, { bio: searchRegex }],
      })
        .select('username displayName avatar level points bio')
        .sort({ points: -1 })
        .skip(type === 'users' ? skip : 0)
        .limit(type === 'users' ? limit : 10);

      results.users = users;
    }

    if (type === 'all' || type === 'tags') {
      const normalizedQuery = query.replace(/^#/, '').toLowerCase().trim();
      const tagSearchRegex = new RegExp(normalizedQuery, 'i');
      
      const postTags = await Post.aggregate([
        { $unwind: '$tags' },
        { $match: { tags: tagSearchRegex } },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: type === 'tags' ? limit : 10 }
      ]);
      
      results.tags = postTags.map((tag) => ({
        tag: tag._id,
        count: tag.count,
        posts: tag.count,
      }));
    }

    const totals = {
      posts: type === 'posts' ? await Post.countDocuments({ content: searchRegex }) : results.posts.length,
      users: type === 'users' ? await User.countDocuments({
        $or: [{ username: searchRegex }, { displayName: searchRegex }, { bio: searchRegex }],
      }) : results.users.length,
      tags: results.tags.length,
    };

    res.json({
      success: true,
      data: {
        results,
        query,
        type,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totals[type as keyof typeof totals] / limit),
          totalResults: totals[type as keyof typeof totals],
          hasMore: skip + (results[type === 'all' ? 'posts' : type] || []).length < totals[type as keyof typeof totals],
        },
      }
    });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

router.get('/advanced', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { User, Post } = await import('../models');
    const query = req.query.q as string;
    const type = (req.query.type as string) || 'all';
    const sortBy = (req.query.sortBy as string) || 'relevance';
    const dateRange = (req.query.dateRange as string) || 'all';
    const minLevel = req.query.minLevel as string;
    const tags = (req.query.tags as string)?.split(',') || [];
    const branch = req.query.branch as string;
    const hasImage = req.query.hasImage === 'true';
    const minLikes = req.query.minLikes as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }

    const searchRegex = new RegExp(query.trim(), 'i');

    let dateFilter = {};
    if (dateRange !== 'all') {
      const now = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      dateFilter = { createdAt: { $gte: startDate } };
    }

    const results: { posts: unknown[]; users: unknown[]; totalPosts: number; totalUsers: number } = {
      posts: [],
      users: [],
      totalPosts: 0,
      totalUsers: 0,
    };

    if (type === 'all' || type === 'posts') {
      const postFilter: any = {
        $and: [
          { $or: [{ content: searchRegex }, { tags: { $in: [searchRegex] } }] },
          dateFilter,
        ],
      };

      if (tags.length > 0) postFilter.$and.push({ tags: { $in: tags } });
      if (hasImage) postFilter.$and.push({ imageUrl: { $exists: true, $ne: null } });
      if (minLikes) postFilter.$and.push({ likesCount: { $gte: parseInt(minLikes) } });

      let sortCriteria: any = {};
      switch (sortBy) {
        case 'newest': sortCriteria = { createdAt: -1 }; break;
        case 'oldest': sortCriteria = { createdAt: 1 }; break;
        case 'mostLiked': sortCriteria = { likesCount: -1 }; break;
        case 'mostCommented': sortCriteria = { commentsCount: -1 }; break;
        default: sortCriteria = { likesCount: -1, createdAt: -1 };
      }

      const posts = await Post.find(postFilter)
        .populate({
          path: 'author',
          select: 'username displayName avatar level branch',
          match: minLevel ? { level: { $gte: parseInt(minLevel) } } : {},
        })
        .sort(sortCriteria)
        .skip(type === 'posts' ? skip : 0)
        .limit(type === 'posts' ? limit : 10)
        .lean();

      results.posts = posts.filter((post) => post.author);
      results.totalPosts = await Post.countDocuments(postFilter);
    }

    if (type === 'all' || type === 'users') {
      const userFilter: any = {
        $or: [{ username: searchRegex }, { displayName: searchRegex }, { bio: searchRegex }],
      };

      if (minLevel) userFilter.level = { $gte: parseInt(minLevel) };
      if (branch) userFilter.branch = branch;

      const users = await User.find(userFilter)
        .select('username displayName avatar level points bio branch location followersCount followingCount')
        .sort({ points: -1, followersCount: -1 })
        .skip(type === 'users' ? skip : 0)
        .limit(type === 'users' ? limit : 10)
        .lean();

      results.users = users;
      results.totalUsers = await User.countDocuments(userFilter);
    }

    const totalResults = type === 'posts' ? results.totalPosts : type === 'users' ? results.totalUsers : results.totalPosts + results.totalUsers;

    res.json({
      success: true,
      data: {
        results,
        query,
        filters: { type, sortBy, dateRange, minLevel, tags, branch, hasImage, minLikes },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalResults / limit),
          totalResults,
          hasMore: skip + (type === 'posts' ? results.posts.length : type === 'users' ? results.users.length : Math.max(results.posts.length, results.users.length)) < totalResults,
        },
      }
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

export default router;
