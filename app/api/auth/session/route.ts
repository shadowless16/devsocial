// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/jwt-auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const tokenPayload = await getUserFromRequest(request);
    
    if (!tokenPayload) {
      return NextResponse.json({
        success: false,
        user: null
      });
    }

    // Get full user data from database
    await connectDB();
    const user = await User.findById(tokenPayload.userId).select('-password');
    
    if (!user) {
      return NextResponse.json({
        success: false,
        user: null
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        role: user.role,
        xp: user.xp,
        level: user.level,
        badges: user.badges,
      }
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({
      success: false,
      user: null
    });
  }
}
