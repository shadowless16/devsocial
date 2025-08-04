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
    const posts = await Post.find({ isAnonymous: false })
      .populate({
        path: "author",
        select: "username displayName avatar level",
        match: { _id: { $exists: true } }, // Ensure author exists
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Filter out posts where author population failed and transform data
    const validPosts = posts
      .filter((post) => post.author !== null)
      .map((post) => ({
        ...post,
        id: post._id.toString(),
        author: post.author ? {
          ...post.author,
          id: post.author._id?.toString(),
        } : null,
        createdAt: new Date(post.createdAt).toLocaleDateString(),
        tags: post.tags || [],
        isLiked: false, // This would be determined by user context in a real app
      }));

    const totalPosts = await Post.countDocuments({
      isAnonymous: false,
      author: { $exists: true, $ne: null },
    });

    return NextResponse.json(
      successResponse({
        posts: validPosts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts,
        },
      })
    );
  } catch (error: any) {
    console.error("[API_POSTS_GET_ERROR]", error);
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
      return NextResponse.json(errorResponse(authResult.message), { status: 401 });
    }

    const body = await req.json();
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
      .populate("author", "username displayName avatar level")
      .lean();

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

    return NextResponse.json(
      successResponse({ post: populatedPost }, "Post created successfully."),
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API_POSTS_POST_ERROR]", error);
    return errorResponse("Failed to create post due to a server error.", 500);
  }
}