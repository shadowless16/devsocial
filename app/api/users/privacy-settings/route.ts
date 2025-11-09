import { NextRequest, NextResponse } from "next/server";
import { getSession } from '@/lib/server-auth';
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    
    const user = await User.findById(session.user.id).select("privacySettings");
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user.privacySettings || {
        profileVisibility: "public",
        showEmail: false,
        showLocation: true,
        showActivity: true,
        showStats: true,
        allowMessages: "followers",
        allowMentions: "everyone",
        showOnlineStatus: true,
        indexProfile: true,
      },
    });
  } catch (error) {
    console.error("Error fetching privacy settings:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate the privacy settings
    const validProfileVisibility = ["public", "followers", "private"];
    const validMessageSettings = ["everyone", "followers", "none"];
    
    if (body.profileVisibility && !validProfileVisibility.includes(body.profileVisibility)) {
      return NextResponse.json(
        { success: false, message: "Invalid profileVisibility value" },
        { status: 400 }
      );
    }
    
    if (body.allowMessages && !validMessageSettings.includes(body.allowMessages)) {
      return NextResponse.json(
        { success: false, message: "Invalid allowMessages value" },
        { status: 400 }
      );
    }
    
    if (body.allowMentions && !validMessageSettings.includes(body.allowMentions)) {
      return NextResponse.json(
        { success: false, message: "Invalid allowMentions value" },
        { status: 400 }
      );
    }

    await connectDB();
    
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { 
        $set: { 
          privacySettings: {
            profileVisibility: body.profileVisibility || "public",
            showEmail: body.showEmail !== undefined ? body.showEmail : false,
            showLocation: body.showLocation !== undefined ? body.showLocation : true,
            showActivity: body.showActivity !== undefined ? body.showActivity : true,
            showStats: body.showStats !== undefined ? body.showStats : true,
            allowMessages: body.allowMessages || "followers",
            allowMentions: body.allowMentions || "everyone",
            showOnlineStatus: body.showOnlineStatus !== undefined ? body.showOnlineStatus : true,
            indexProfile: body.indexProfile !== undefined ? body.indexProfile : true,
          }
        }
      },
      { new: true, select: "privacySettings" }
    );
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user.privacySettings,
      message: "Privacy settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}