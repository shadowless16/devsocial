// app/api/posts/route.ts
import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import { authMiddleware, type AuthenticatedRequest } from "@/middleware/auth";
import { successResponse, errorResponse } from "@/utils/response";
import { awardXP, checkFirstTimeAction } from "@/utils/awardXP";
import UserStats from "@/models/UserStats";
import { checkReferralMiddleware } from "@/utils/check-referral-middleware";
import { processMentions } from "@/utils/mention-utils";
import { hashPost } from "@/lib/canonicalizer";
import { enqueueImprintJob } from "@/services/imprintQueue";

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
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const dataMode = searchParams.get("dataMode") as 'real' | 'generated' || 'real';
    const skip = (page - 1) * limit;

    // Get current user ID if authenticated
    let currentUserId = null;
    try {
      const authResult = await authMiddleware(req);
      if (authResult.success) {
        currentUserId = (req as AuthenticatedRequest).user.id;
      }
    } catch (error) {
      // Continue without authentication for public posts
    }

    // Build user filter based on data mode
    let userFilter = {};
    if (dataMode === 'real') {
      userFilter = { isGenerated: { $ne: true } };
    } else if (dataMode === 'generated') {
      userFilter = { isGenerated: true };
    }

    // Get user IDs that match the filter
    const filteredUsers = await User.find(userFilter).select('_id');
    const userIds = filteredUsers.map(u => u._id);

    // Fetch posts from filtered users
    const posts = await Post.find({ author: { $in: userIds } })
      .populate({
        path: "author",
        select: "username firstName lastName avatar level isGenerated",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get user likes if authenticated
    let userLikes = new Set();
    if (currentUserId) {
      const Like = (await import("@/models/Like")).default;
      const likes = await Like.find({ user: currentUserId }).select('post').lean();
      userLikes = new Set(likes.map(like => like.post.toString()));
    }

    // Filter out posts where author population failed and transform data
    const validPosts = posts
      .filter((post) => post.author !== null)
      .map((post: any) => ({
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

    const totalPosts = await Post.countDocuments({
      author: { $in: userIds },
    });

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
    
    return NextResponse.json(responseData);
  } catch (error: any) {
    return errorResponse("Failed to fetch posts due to a server error.", 500);
  }
}

//================================================================//
//  POST /api/posts - Create a new post
//================================================================//
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error || 'Authentication failed'), { status: 401 });
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
    
    const { content, tags, isAnonymous, imageUrl, imageUrls, videoUrls } = body;
    const authorId = (req as AuthenticatedRequest).user.id;

    if (!content || content.trim().length === 0) {
      return errorResponse("Post content cannot be empty.", 400);
    }

    await connectDB();

    // Verify author exists
    const author = await User.findById(authorId);
    if (!author) {
      return errorResponse("Author not found.", 404);
    }

    const newPost = await Post.create({
      content,
      author: authorId,
      tags: tags || [],
      imageUrl: imageUrl || null,
      imageUrls: imageUrls || [],
      videoUrls: videoUrls || [],
      isAnonymous: isAnonymous || false,
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
      .populate("author", "username firstName lastName avatar level")
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

    // Process mentions in the post content
    await processMentions(content, newPost._id.toString(), authorId);

    // Award XP for post creation
    const isFirstPost = await checkFirstTimeAction(authorId, "post");
    if (isFirstPost) {
      await awardXP(authorId, "first_post", newPost._id.toString());
    } else {
      await awardXP(authorId, "post_creation", newPost._id.toString());
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