// app/api/users/profile/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import User, { IUser } from "@/models/User";
import connectDB from "@/lib/db";
import { successResponse, errorResponse } from "@/utils/response";
import { logger } from "@/lib/logger";

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
    
    logger.api('Profile API called, attempting DB connection');
    
    try {
      await connectDB();
      logger.api('Database connected successfully');
    } catch (dbError: any) {
      logger.error('Database connection failed:', dbError.message);
      return NextResponse.json({ 
        success: false, 
        error: "Database connection failed" 
      }, { status: 500 });
    }
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      logger.api('No session found');
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 });
    }

    logger.api('Session found for user:', session.user.id);
    
    const user = await User.findById(session.user.id).select("-password").lean();

    if (!user) {
      logger.api('User not found in database');
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 });
    }

    logger.api('User found, returning profile');
    
    return NextResponse.json({
      success: true,
      data: { user }
    });
  } catch (error: any) {
    logger.error('Profile API error:', error.message, error.stack);
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
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    const {
      displayName, bio, affiliation, location, website, avatar, bannerUrl,
      currentPassword, newPassword
    } = body;

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return NextResponse.json(errorResponse("User not found"), { status: 404 });
    }

    const updateData: Partial<IUser> = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (affiliation !== undefined) updateData.affiliation = affiliation;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (avatar !== undefined) updateData.avatar = avatar;
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
      data: { user: updatedUser, message: "Profile updated successfully" }
    });
  } catch (error) {
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}
