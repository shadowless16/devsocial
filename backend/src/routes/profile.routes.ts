import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { User, UserProfile } = await import('../models');
    const userId = req.user!.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let userProfile = await UserProfile.findOne({ user: userId });
    
    if (!userProfile) {
      userProfile = await UserProfile.create({
        user: userId,
        techStack: user.techStack || [],
        socialLinks: [
          user.githubUsername ? { platform: 'GitHub', url: `https://github.com/${user.githubUsername}` } : null,
          user.linkedinUrl ? { platform: 'LinkedIn', url: user.linkedinUrl } : null,
          user.portfolioUrl ? { platform: 'Portfolio', url: user.portfolioUrl } : null
        ].filter(Boolean),
        skills: [],
        privacySettings: {
          profileVisibility: true,
          showEmail: false,
          showLocation: true,
          showActivity: true,
          allowMessages: true,
          showStats: true
        }
      });
    }

    const profileData = {
      name: user.displayName || user.username,
      title: userProfile.title || 'Developer',
      location: userProfile.location || user.location,
      joinDate: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      bio: userProfile.bio || user.bio,
      avatar: user.avatar,
      techStack: userProfile.techStack,
      socialLinks: userProfile.socialLinks,
      skills: userProfile.skills,
      privacySettings: userProfile.privacySettings
    };

    res.json({ profile: profileData });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { UserProfile } = await import('../models');
    const userId = req.user!.id;
    const { title, bio, location, techStack, socialLinks, skills, privacySettings } = req.body;

    let userProfile = await UserProfile.findOne({ user: userId });
    
    if (!userProfile) {
      userProfile = new UserProfile({ user: userId });
    }

    if (title !== undefined) userProfile.title = title;
    if (bio !== undefined) userProfile.bio = bio;
    if (location !== undefined) userProfile.location = location;
    if (techStack !== undefined) userProfile.techStack = techStack;
    if (socialLinks !== undefined) userProfile.socialLinks = socialLinks;
    if (skills !== undefined) userProfile.skills = skills;
    if (privacySettings !== undefined) userProfile.privacySettings = { ...userProfile.privacySettings, ...privacySettings };

    await userProfile.save();

    res.json({ message: 'Profile updated successfully', profile: userProfile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/activity', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { Activity, Post } = await import('../models');
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;

    const [activities, posts] = await Promise.all([
      Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).lean(),
      Post.find({ author: userId }).sort({ createdAt: -1 }).limit(limit).lean()
    ]);

    const getRelativeTime = (date: Date) => {
      const diff = Date.now() - new Date(date).getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      return 'Just now';
    };

    const transformedActivities = activities.map(activity => ({
      type: activity.type === 'post_created' ? 'post' : activity.type,
      title: activity.type,
      description: activity.description,
      timestamp: getRelativeTime(activity.createdAt),
      xpEarned: activity.xpEarned,
      createdAt: activity.createdAt
    }));

    const transformedPosts = posts.map(post => ({
      type: 'post',
      title: 'Created a new post',
      description: post.content?.substring(0, 100) + '...',
      timestamp: getRelativeTime(post.createdAt),
      xpEarned: 10,
      createdAt: post.createdAt,
      engagement: { likes: post.likesCount || 0, comments: post.commentsCount || 0 }
    }));

    const combined = [...transformedActivities, ...transformedPosts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    const filtered = type && type !== 'all' ? combined.filter(item => item.type === type) : combined;

    res.json({ activities: filtered });
  } catch (error) {
    console.error('Get profile activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { User, Post, ChallengeParticipation } = await import('../models');
    const userId = req.user!.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [postsCreated, challengesCompleted, usersWithHigherPoints] = await Promise.all([
      Post.countDocuments({ author: userId }),
      ChallengeParticipation.countDocuments({ user: userId, status: 'completed' }),
      User.countDocuments({ points: { $gt: user.points } })
    ]);

    const stats = {
      totalXP: user.points,
      challengesCompleted,
      communityRank: usersWithHigherPoints + 1,
      postsCreated
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get profile stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
