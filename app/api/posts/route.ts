// app/api/posts/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { connectWithRetry } from "@/lib/connect-with-retry";
import Post from "@/models/Post";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/response";
import { awardXP, checkFirstTimeAction } from "@/utils/awardXP";
import UserStats from "@/models/UserStats";
import { checkReferralMiddleware } from "@/utils/check-referral-middleware";
import { processMentions } from "@/utils/mention-utils";
import { hashPost } from "@/lib/canonicalizer";
import { extractHashtags, findOrCreateTags } from "@/utils/tag-utils";
import { enqueueImprintJob } from "@/services/imprintQueue";
import Activity from '@/models/Activity'
import Notification from '@/models/Notification'
import { getWebSocketServer } from '@/lib/websocket'
import { cache } from '@/lib/cache'
import { mistralBackgroundService } from '@/lib/ai/mistral-background-service'

// Only import mission models if needed
let MissionProgress: any = null;

try {
  MissionProgress = require("@/models/MissionProgress").default;
} catch (error) {
  console.warn("MissionProgress model not available:", error);
}

export const dynamic = 'force-dynamic'

//================================================================//
//  GET /api/posts - Fetch a feed of posts
//================================================================//
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const dataMode = searchParams.get("dataMode") as 'real' | 'generated' || 'real';
    const skip = (page - 1) * limit;

    // Check cache first for page 1 (most common request)
    const cacheKey = `posts_${page}_${limit}_${dataMode}`;
    if (page === 1) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    await connectWithRetry();

    // Get current user ID if authenticated
    let currentUserId = null;
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        currentUserId = session.user.id;
      }
    } catch (error) {
      // Continue without authentication for public posts
    }

    // Optimized query with proper indexing
    const posts = await Post.find()
      .populate({
        path: 'author',
        select: 'username firstName lastName avatar level role isGenerated',
        match: dataMode === 'real' 
          ? { isGenerated: { $ne: true } }
          : dataMode === 'generated'
          ? { isGenerated: true }
          : {}
      })
      .select('content author tags imageUrl imageUrls videoUrls isAnonymous createdAt likesCount commentsCount viewsCount xpAwarded poll')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Filter out posts with null authors (due to populate match)
    const filteredPosts = posts.filter(post => post.author);

    // Get user likes if authenticated - single optimized query
    let userLikes = new Set();
    if (currentUserId && filteredPosts.length > 0) {
      const Like = (await import("@/models/Like")).default;
      const postIds = filteredPosts.map(p => p._id);
      const likes = await Like.find({ 
        user: currentUserId, 
        targetId: { $in: postIds },
        targetType: 'post'
      }).select('targetId').lean();
      userLikes = new Set(likes.map(like => like.targetId.toString()));
    }

    // Transform filtered posts
    const validPosts = filteredPosts.map((post: any) => ({
      ...post,
      id: post._id.toString(),
      author: post.author ? {
        ...post.author,
        id: post.author._id?.toString(),
        displayName: post.author.firstName && post.author.lastName 
          ? `${post.author.firstName} ${post.author.lastName}` 
          : post.author.username,
      } : null,
      createdAt: new Date(post.createdAt).toISOString(),
      tags: post.tags || [],
      viewsCount: post.viewsCount || 0,
      isLiked: currentUserId ? userLikes.has(post._id.toString()) : false,
    }));

    // Use count with filter for accuracy, but limit to reasonable number
    const totalPosts = dataMode === 'real' || dataMode === 'generated' 
      ? Math.min(await Post.countDocuments(), 10000) // Cap at 10k for performance
      : await Post.estimatedDocumentCount();

    const responseData = {
      success: true,
      data: {
        posts: validPosts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts,
        },
      },
    };
    
    // Cache page 1 for 60 seconds to improve performance
    if (page === 1) {
      cache.set(cacheKey, responseData, 60000);
    }
    
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Posts API error:', error);
    // Return fallback data when database is unavailable
    const fallbackData = {
      success: true,
      data: {
        posts: [
          {
            id: 'demo1',
            content: 'Welcome to DevSocial! This is a demo post while the database is connecting.',
            author: { id: 'demo', username: 'demo', displayName: 'Demo User', avatar: '/placeholder.svg', level: 1 },
            tags: ['demo', 'welcome'],
            createdAt: new Date().toISOString(),
            likesCount: 5,
            commentsCount: 2,
            viewsCount: 10,
            isLiked: false
          }
        ],
        pagination: { currentPage: 1, totalPages: 1, totalPosts: 1 }
      }
    }
    return NextResponse.json(fallbackData);
  }
}

//================================================================//
//  POST /api/posts - Create a new post
//================================================================//
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
    }

    let body;
    try {
      const rawBody = await req.text();
      
      if (!rawBody || rawBody.trim() === '') {
        return NextResponse.json(errorResponse("Request body is empty"), { status: 400 });
      }
      
      body = JSON.parse(rawBody);
    } catch (jsonError) {
      return NextResponse.json(errorResponse("Invalid JSON in request body"), { status: 400 });
    }
    
    const { content, tags, isAnonymous, imageUrl, imageUrls, videoUrls, poll } = body;
    const authorId = session.user.id;

    // Allow empty content if poll exists
    if ((!content || content.trim().length === 0) && !poll) {
      return NextResponse.json(errorResponse("Post content cannot be empty."), { status: 400 });
    }

    // Check content length limit with user-friendly message
    if (content.length > 2000) {
      const wordCount = content.split(/\s+/).length;
      return NextResponse.json(errorResponse(
        `Your post is too long! Please keep it under 2000 characters. Your post has ${content.length} characters (approximately ${wordCount} words). Try breaking it into multiple posts or removing some content.`
      ), { status: 400 });
    }

    await connectWithRetry();

    // Verify author exists
    const author = await User.findById(authorId);
    if (!author) {
      return errorResponse("Author not found.", 404);
    }

    // Extract hashtags from content
    const extractedHashtags = extractHashtags(content);
    const allTags = [...(tags || []), ...extractedHashtags];
    const uniqueTags = [...new Set(allTags)];

    // Create or find tags in database
    let tagIds = [];
    if (uniqueTags.length > 0) {
      tagIds = await findOrCreateTags(uniqueTags, authorId);
    }

    // Process mentions before creating post
    const { mentions, mentionIds } = await processMentions(content, '', authorId);

    const newPost = await Post.create({
      content: content || '',
      author: authorId,
      tags: uniqueTags,
      tagIds,
      mentions,
      mentionIds,
      imageUrl: imageUrl || null,
      imageUrls: imageUrls || [],
      videoUrls: videoUrls || [],
      isAnonymous: isAnonymous || false,
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      poll: poll || null,
    });

    // Compute contentHash and set imprint status
    const contentHash = hashPost(newPost);
    await Post.findByIdAndUpdate(newPost._id, {
      contentHash,
      imprintStatus: "pending"
    });

    // Enqueue imprint job
    await enqueueImprintJob({
      postId: newPost._id.toString(),
      contentHash
    });

    const populatedPost = await Post.findById(newPost._id)
      .populate("author", "username firstName lastName avatar level role")
      .lean();

    if (!populatedPost) {
      return errorResponse("Failed to retrieve created post.", 500);
    }

    // Transform the post data to match frontend expectations
    const postData = populatedPost as any;
    const postAuthor = postData.author;
    const transformedPost = {
      ...postData,
      id: postData._id.toString(),
      author: postAuthor ? {
        ...postAuthor,
        id: postAuthor._id?.toString(),
        displayName: postAuthor.firstName && postAuthor.lastName 
          ? `${postAuthor.firstName} ${postAuthor.lastName}` 
          : postAuthor.username,
      } : null,
      createdAt: new Date(postData.createdAt).toISOString(),
      tags: postData.tags || [],
      likesCount: postData.likesCount || 0,
      commentsCount: postData.commentsCount || 0,
      viewsCount: postData.viewsCount || 0,
      xpAwarded: postData.xpAwarded || 0,
    };

    // Update mentions with actual post ID
    if (mentions.length > 0) {
      await processMentions(content, newPost._id.toString(), authorId);
    }

    // Create an Activity record so the user's profile activity shows this post
    try {
      await Activity.create({
        user: authorId,
        type: 'post_created',
        description: 'Created a new post',
        metadata: { postId: newPost._id.toString(), content },
        xpEarned: 0,
      })
    } catch (actErr) {
      console.warn('Failed to create activity for new post:', actErr)
      // Do not fail post creation if activity logging fails
    }

    // Check for daily hashtag bonus
    const dailyHashtags = {
      0: { hashtag: 'studysunday', xp: 75 }, // Sunday
      1: { hashtag: 'motivationmonday', xp: 50 }, // Monday
      2: { hashtag: 'tutorialtuesday', xp: 100 }, // Tuesday
      3: { hashtag: 'wipwednesday', xp: 60 }, // Wednesday
      4: { hashtag: 'throwbackthursday', xp: 40 }, // Thursday
      5: { hashtag: 'featurefriday', xp: 80 }, // Friday
      6: { hashtag: 'socialsaturday', xp: 30 }, // Saturday
    };
    
    const today = new Date().getDay();
    const todayChallenge = dailyHashtags[today as keyof typeof dailyHashtags];
    const hasDailyHashtag = uniqueTags.some(tag => 
      tag.toLowerCase().replace(/[^a-z0-9]/g, '') === todayChallenge.hashtag
    );

    // Mistral AI Quality Analysis (background task)
    let qualityBonus = 0;
    let qualityCategory = 'standard';
    if (content && content.trim().length > 50) {
      try {
        const analysis = await mistralBackgroundService.analyzeQuality(content);
        qualityBonus = analysis.xpBonus;
        qualityCategory = analysis.category;
        
        // Update post with quality metadata
        await Post.findByIdAndUpdate(newPost._id, {
          $set: {
            'metadata.aiQuality': {
              score: analysis.score,
              category: analysis.category,
              reasoning: analysis.reasoning,
              hasCode: analysis.hasCode,
              isEducational: analysis.isEducational,
              analyzedAt: new Date()
            }
          }
        });
      } catch (aiError) {
        console.warn('Mistral quality analysis failed:', aiError);
      }
    }

    // Award XP for post creation
    const isFirstPost = await checkFirstTimeAction(authorId, "post");
    if (isFirstPost) {
      await awardXP(authorId, "first_post", newPost._id.toString());
    } else {
      await awardXP(authorId, "post_creation", newPost._id.toString());
    }
    
    // Award quality bonus XP
    if (qualityBonus > 0) {
      await awardXP(authorId, "quality_content", newPost._id.toString(), qualityBonus);
      
      // Create activity for quality bonus
      await Activity.create({
        user: authorId,
        type: 'quality_bonus',
        description: `Earned quality bonus: ${qualityCategory}`,
        metadata: { postId: newPost._id.toString(), category: qualityCategory, bonus: qualityBonus },
        xpEarned: qualityBonus,
      });
    }

    // Award bonus XP for daily hashtag participation
    if (hasDailyHashtag) {
      await awardXP(authorId, "daily_challenge", newPost._id.toString(), todayChallenge.xp);
    }

    // Update user stats
    await UserStats.findOneAndUpdate(
      { user: authorId },
      { 
        $inc: { totalPosts: 1 },
        $set: { lastActiveAt: new Date() }
      },
      { upsert: true }
    );

    // Check if this user has completed any referral requirements
    await checkReferralMiddleware(authorId);

    // Only track mission progress if user has explicitly joined missions
    if (MissionProgress) {
      try {
        const activeMissions = await MissionProgress.find({
          user: authorId,
          status: "active"
        }).populate('mission');

        for (const progress of activeMissions) {
          if (!progress.mission) continue;
          
          const mission = progress.mission;
          let progressUpdated = false;
          
          for (const step of mission.steps || []) {
            const stepId = step.id || step._id?.toString();
            if (stepId && !progress.stepsCompleted.includes(stepId)) {
              // Check if this step is related to creating posts
              const stepText = ((step.title || '') + ' ' + (step.description || '')).toLowerCase();
              if (stepText.includes('post') && (stepText.includes('create') || stepText.includes('share') || stepText.includes('publish'))) {
                // Get current post count for user
                const userPostCount = await Post.countDocuments({ author: authorId });
                
                // Check if target is met
                if (userPostCount >= (step.target || 1)) {
                  progress.stepsCompleted.push(stepId);
                  progressUpdated = true;
                }
              }
            }
          }
          
          // Check if mission is completed
          if (progress.stepsCompleted.length >= (mission.steps?.length || 0) && progress.status !== 'completed') {
            progress.status = "completed";
            progress.completedAt = new Date();
            progress.xpEarned = mission.rewards?.xp || 0;
            progressUpdated = true;
          }
          
          if (progressUpdated) {
            await progress.save();
          }
        }
      } catch (missionError) {
        console.warn('Mission progress tracking failed, continuing with post creation:', missionError);
        // Don't fail the post creation if mission tracking fails
      }
    }

    // Send a lightweight notification to followers/author's sockets if available
    try {
      const wsServer = getWebSocketServer()
      if (wsServer) {
        wsServer.broadcast('post_created', {
          postId: newPost._id.toString(),
          authorId,
          content: content.substring(0, 200),
        })
      }
    } catch (wsErr) {
      console.warn('Failed to emit websocket post_created event:', wsErr)
    }

    const responseData = {
      success: true,
      data: { post: transformedPost, message: "Post created successfully." }
    };
    
    return NextResponse.json(
      responseData,
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Post creation error:', error);
    return NextResponse.json(errorResponse("Failed to create post due to a server error."), { status: 500 });
  }
}