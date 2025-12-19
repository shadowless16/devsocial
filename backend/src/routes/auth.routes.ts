import { Router } from 'express'
import User from '../models/User'
import Follow from '../models/Follow'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { awardXP } from '../utils/awardXP'
import { ReferralSystemFixed } from '../utils/referral-system-fixed'
import { generateAvatarFromUsername } from '../utils/avatar-generator'

const router = Router()

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, birthMonth, birthDay, affiliation, referralCode } = req.body
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email?.toLowerCase() }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: existingUser.email === email?.toLowerCase() ? "Email already exists" : "Username already exists" 
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Simple avatar generation (using dicebear style from frontend utils if possible)
    const initialAvatar = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`

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

    const user = await User.create({ 
      username, 
      email: email.toLowerCase(), 
      password: hashedPassword,
      firstName,
      lastName,
      birthMonth,
      birthDay,
      affiliation: affiliation || "Other",
      avatar: initialAvatar,
      points: 10,
      badges: ["newcomer"],
      registrationSource: referrerInfo ? "referral" : "direct",
      referrer: referrerInfo ? referrerInfo.username : "",
    })

    // Award signup XP
    await awardXP(user._id.toString(), "daily_login")

    // Auto-follow AkDavid
    try {
      const akDavid = await User.findOne({ username: "AkDavid" })
      if (akDavid && akDavid._id.toString() !== user._id.toString()) {
        await Follow.create({
          follower: user._id,
          following: akDavid._id,
        })
      }
    } catch (error) {
      console.error("Auto-follow error:", error)
    }

    // Handle referral
    if (referralCode && referrerInfo) {
      try {
        await ReferralSystemFixed.processReferralFromSignup(referralCode, user._id.toString())
      } catch (error) {
        console.error("Referral processing error:", error)
      }
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role }, 
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    )

    res.status(201).json({ 
      success: true, 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        points: user.points,
        level: user.level,
      } 
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ success: false, message: 'Signup failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, usernameOrEmail, password } = req.body
    const identifier = usernameOrEmail || email

    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Missing credentials' })
    }

    // Search by email (case-insensitive) or username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier }
      ]
    })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role }, 
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    )

    res.json({ 
      success: true, 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      } 
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, error: 'Login failed' })
  }
})

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email: email?.toLowerCase() })

    if (!user) {
      return res.json({ success: true, message: "If an account with that email exists, we've sent a password reset link." })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour
    await user.save()

    console.log(`[Auth] Password reset requested for ${email}. Token: ${resetToken}`)
    // In production, send email here

    res.json({ success: true, message: "If an account with that email exists, we've sent a password reset link." })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ success: false, message: 'Process failed' })
  }
})

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    })

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' })
    }

    user.password = await bcrypt.hash(password, 12)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ success: true, message: 'Password has been reset' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ success: false, message: 'Process failed' })
  }
})

router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body
    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }
    })

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' })
    }

    user.isVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpires = undefined
    await user.save()

    // Award XP for email verification
    await awardXP(user._id.toString(), "email_verified")

    res.json({ success: true, message: 'Email verified successfully' })
  } catch (error) {
    console.error('Verify email error:', error)
    res.status(500).json({ success: false, message: 'Process failed' })
  }
})

export default router
