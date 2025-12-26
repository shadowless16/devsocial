import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/core/db"
import User from "@/models/User"
import Follow from "@/models/Follow"
import { signupSchema } from "@/utils/validation"
import { successResponse, errorResponse, validationErrorResponse } from "@/utils/response"
import { awardXP } from "@/utils/awardXP"
import { ReferralSystemFixed } from "@/utils/referral-system-fixed"
import { generateAvatarFromUsername } from "@/utils/avatar-generator"
import { AuthService } from "@/lib/auth/auth"
import { getWelcomeEmailTemplate } from "@/lib/email/templates/welcome"
import { sendEmail } from "@/lib/core/email"


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
        const errorMessage = error instanceof Error ? error.message : 'Referral validation error'
        console.error("Referral validation error:", errorMessage)
      }
    }

    // Generate verification token
    const verificationToken = AuthService.generateVerificationToken() 
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

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
      verificationToken,
      verificationTokenExpires: verificationExpires,
      isVerified: false,
    })

    // Send Welcome / Verification Email
    try {
      const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`
      const html = getWelcomeEmailTemplate(username, verificationLink)
      
      await sendEmail({
        to: email,
        subject: 'Welcome to DevSocial! Verify your email',
        html,
      })
      console.log(`[Signup] Verification email sent to ${email}`)
    } catch (emailError) {
      console.error('[Signup] Failed to send verification email:', emailError)
      // Don't fail signup if email fails, but log it
    }

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
      const errorMessage = error instanceof Error ? error.message : 'Auto-follow AkDavid error'
      console.error("Auto-follow AkDavid error:", errorMessage)
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
        const errorMessage = error instanceof Error ? error.message : 'Referral creation error'
        console.error("❌ Referral creation error:", errorMessage)
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
    const errorMessage = error instanceof Error ? error.message : 'Signup error'
    console.error("Signup error:", errorMessage)
    return errorResponse("Internal server error", 500)
  }
}
