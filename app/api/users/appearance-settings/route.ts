import { NextRequest, NextResponse } from "next/server";
import { getSession } from '@/lib/server-auth';
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    
   if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    
    const user = await User.findById(session.user.id).select("appearanceSettings");
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user.appearanceSettings || {
        theme: "system",
        fontSize: "medium",
        compactMode: false,
        highContrast: false,
        reducedMotion: false,
        colorScheme: "default",
        sidebarCollapsed: false,
        showAvatars: true,
      },
    });
  } catch (error) {
    console.error("Error fetching appearance settings:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate the appearance settings
    const validThemes = ["light", "dark", "system"];
    const validFontSizes = ["small", "medium", "large"];
    const validColorSchemes = ["default", "blue", "green", "purple", "orange"];
    
    if (body.theme && !validThemes.includes(body.theme)) {
      return NextResponse.json(
        { success: false, message: "Invalid theme value" },
        { status: 400 }
      );
    }
    
    if (body.fontSize && !validFontSizes.includes(body.fontSize)) {
      return NextResponse.json(
        { success: false, message: "Invalid fontSize value" },
        { status: 400 }
      );
    }
    
    if (body.colorScheme && !validColorSchemes.includes(body.colorScheme)) {
      return NextResponse.json(
        { success: false, message: "Invalid colorScheme value" },
        { status: 400 }
      );
    }

    await connectDB();
    
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { 
        $set: { 
          appearanceSettings: {
            theme: body.theme || "system",
            fontSize: body.fontSize || "medium",
            compactMode: body.compactMode || false,
            highContrast: body.highContrast || false,
            reducedMotion: body.reducedMotion || false,
            colorScheme: body.colorScheme || "default",
            sidebarCollapsed: body.sidebarCollapsed || false,
            showAvatars: body.showAvatars !== undefined ? body.showAvatars : true,
          }
        }
      },
      { new: true, select: "appearanceSettings" }
    );
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user.appearanceSettings,
      message: "Appearance settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating appearance settings:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
