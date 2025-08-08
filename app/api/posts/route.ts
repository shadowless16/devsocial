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

//================================================================//
//  GET /api/posts - Fetch a feed of posts
//================================================================//
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Fetch posts and ensure author exists
    const posts = await Post.find({})
      .populate({
        path: "author",
        select: "username firstName lastName avatar level",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

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
        isLiked: false,
      }));

    const totalPosts = await Post.countDocuments({
      author: { $exists: true, $ne: null },
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

    const responseData = {
      success: true,
      data: { post: transformedPost, message: "Post created successfully." }
    };
    
    return NextResponse.json(
      responseData,
      { status: 201 }
    );
  } catch (error: any) {
    return errorResponse("Failed to create post due to a server error.", 500);
  }
}