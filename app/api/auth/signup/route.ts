import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/db"
import User from "@/models/User"
import Follow from "@/models/Follow"
import { signupSchema } from "@/utils/validation"
import { successResponse, errorResponse, validationErrorResponse } from "@/utils/response"
import { awardXP } from "@/utils/awardXP"
import { ReferralSystemFixed } from "@/utils/referral-system-fixed"
import { generateAvatarFromUsername } from "@/utils/avatar-generator"


export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    console.log('Signup request body:', JSON.stringify(body, null, 2))
    const { referralCode } = body

    // Validate input
    const validation = signupSchema.safeParse(body)
    if (!validation.success) {
      console.log('Validation failed:', validation.error.format())
      return validationErrorResponse(validation.error.format())
    }

    const { username, email, password, firstName, lastName, birthMonth, birthDay, affiliation } = validation.data

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return errorResponse("Email already exists", 400)
      }
      if (existingUser.username === username) {
        return errorResponse("Username already exists", 400)
      }
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Generate initial avatar (will be updated during onboarding)
    const initialAvatar = generateAvatarFromUsername(username);

    // Validate referral code if provided
    let referrerInfo = null
    if (referralCode) {
      try {
        const validation = await ReferralSystemFixed.validateReferralCode(referralCode)
        if (validation.valid && validation.referrer) {
          referrerInfo = validation.referrer
        }
      } catch (error) {
        console.error("Referral validation error:", error)
      }
    }

    // Create user with proper referral fields
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      birthMonth,
      birthDay,
      affiliation: affiliation || "Other",
      avatar: initialAvatar,
      points: 10, // Starting XP
      badges: ["newcomer"], // Starting badge
      registrationSource: referrerInfo ? "referral" : "direct",
      referrer: referrerInfo ? referrerInfo.username : "",
    })

    // Award signup XP
    await awardXP(user._id.toString(), "daily_login")

    // Auto-follow AkDavid (platform creator)
    try {
      const akDavid = await User.findOne({ username: "AkDavid" })
      if (akDavid) {
        await Follow.create({
          follower: user._id,
          following: akDavid._id,
        })
      }
    } catch (error) {
      console.error("Auto-follow AkDavid error:", error)
    }

    // Handle referral if code was provided and validated
    if (referralCode && referrerInfo) {
      try {
        console.log(`Processing referral for ${user.username} with code ${referralCode} from ${referrerInfo.username}`)
        const success = await ReferralSystemFixed.processReferralFromSignup(referralCode, user._id.toString())
        if (success) {
          console.log(`✅ Referral processed successfully for user ${user.username} with code ${referralCode}`)
        } else {
          console.log(`❌ Referral processing failed for user ${user.username} with code ${referralCode}`)
        }
      } catch (error) {
        console.error("❌ Referral creation error:", error)
        // Don't fail the signup if referral fails
      }
    } else if (referralCode) {
      console.log(`❌ Referral code ${referralCode} provided but validation failed or referrer not found`)
    }

    // Return user data (excluding password) - NextAuth will handle authentication
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthMonth: user.birthMonth,
      birthDay: user.birthDay,
      bio: user.bio,
      affiliation: user.affiliation,
      avatar: user.avatar,
      role: user.role,
      points: user.points,
      level: user.level,
      badges: user.badges,
      createdAt: user.createdAt,
    }

    return NextResponse.json(
      successResponse({
        message: "Account created successfully. Please sign in.",
        user: userData,
      }),
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return errorResponse("Internal server error", 500)
  }
}
