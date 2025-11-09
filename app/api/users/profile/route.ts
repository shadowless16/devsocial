// app/api/users/profile/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getSession } from '@/lib/server-auth';
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import User, { IUser } from "@/models/User";
import { connectWithRetry } from "@/lib/connect-with-retry";
import { successResponse, errorResponse } from "@/utils/response";
import logger from "@/lib/logger";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// --- GET Handler ---
export async function GET(req: NextRequest) {
  try {
    // Check environment variables
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not found in environment variables');
      return NextResponse.json({ 
        success: false, 
        error: "Database configuration error" 
      }, { status: 500 });
    }
    
    logger.info('Profile API called, attempting DB connection');
    
    try {
      await connectWithRetry();
      logger.info('Database connected successfully');
    } catch (dbError: any) {
      logger.error('Database connection failed:', dbError.message);
      return NextResponse.json({ 
        success: false, 
        error: "Database connection failed" 
      }, { status: 500 });
    }
    
    const session = await getSession(req);
    
    if (!session || !session.user?.id) {
      logger.info('No session found');
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 });
    }

    logger.info('Session found for user:', { userId: session.user.id });
    
    const user = await User.findById(session.user.id).select("-password").lean();

    if (!user) {
      logger.info('User not found in database');
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 });
    }

    logger.info('User found, returning profile');
    
    return NextResponse.json({
      success: true,
      data: { user }
    });
  } catch (error: any) {
    logger.error('Profile API error:', { message: error.message, stack: error.stack });
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}


// --- PUT Handler ---
export async function PUT(req: NextRequest) {
  try {
    await connectWithRetry();
    
    const session = await getSession(req);
    if (!session || !session.user?.id) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    const {
      firstName, lastName, displayName, bio, affiliation, location, website, avatar, bannerUrl,
      currentPassword, newPassword
    } = body;

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return NextResponse.json(errorResponse("User not found"), { status: 404 });
    }

    // Normalize avatar helper (same logic as lib/avatar-utils but local to avoid import)
    const normalizeAvatar = (a?: string | null): string | undefined => {
      if (!a) return undefined;
      let url = String(a).trim();
      url = url.replace(/^['"]+|['"]+$/g, '');
      if (url.includes('models.readyplayer.me')) {
        const baseUrl = url.split('?')[0];
        return baseUrl.replace(/\.glb$/i, '.png');
      }
      return url;
    };

    const updateData: Partial<IUser> = {};
    let earnedXP = 0;
    let earnedBadge = null;

    // Check if user is uploading a custom avatar for the first time
    const isFirstCustomAvatar = avatar && 
      (!user.avatar || user.isGenerated) && 
      !avatar.includes('dicebear') && 
      !avatar.includes('placeholder');

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (affiliation !== undefined) updateData.affiliation = affiliation;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (avatar !== undefined) {
      updateData.avatar = normalizeAvatar(avatar as string);
      if (isFirstCustomAvatar) {
        updateData.isGenerated = false;
        earnedXP = 50;
        earnedBadge = "first_impression";
        if (!user.badges.includes("first_impression")) {
          updateData.badges = [...user.badges, "first_impression"];
        }
        updateData.points = (user.points || 0) + earnedXP;
      }
    }
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;

    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password!);
      if (!isPasswordValid) {
        return NextResponse.json(errorResponse("Current password is incorrect"), { status: 400 });
      }
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    return NextResponse.json({
      success: true,
      data: { 
        user: updatedUser, 
        message: "Profile updated successfully",
        reward: earnedXP > 0 ? {
          xp: earnedXP,
          badge: earnedBadge,
          message: "🎉 First Impression badge earned! +50 XP"
        } : null
      }
    });
  } catch (error) {
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}
