// models/User.ts
import mongoose, { Schema, Document, models, model } from "mongoose";

// Your existing, detailed interface
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  birthMonth?: number;
  birthDay?: number;
  bio: string;
  affiliation: string;
  avatar: string;
  bannerUrl: string;
  role: "user" | "moderator" | "admin";
  gender?: "male" | "female" | "other";
  userType?: "student" | "developer" | "designer" | "entrepreneur" | "other";
  techCareerPath?: string;
  techStack?: string[];
  experienceLevel?: "beginner" | "intermediate" | "advanced" | "expert";
  githubUsername?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  points: number;
  badges: string[];
  level: number;
  isVerified: boolean;
  displayName?: string;
  location?: string;
  website?: string;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshTokens: string[];
  lastLogin?: Date;
  loginStreak: number;
  lastStreakDate?: Date;
  referralCode?: string;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      // You might want to add select: false here to hide it from queries
      // select: false, 
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    birthMonth: {
      type: Number,
      min: 1,
      max: 12,
    },
    birthDay: {
      type: Number,
      min: 1,
      max: 31,
    },
    bio: {
      type: String,
      maxlength: 250,
      default: "",
    },
    affiliation: {
      type: String,
      maxlength: 100,
      default: "Other",
    },
    techCareerPath: {
      type: String,
      enum: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile Developer", "DevOps Engineer", "Data Scientist", "ML Engineer", "Cloud Architect", "Security Engineer", "UI/UX Designer", "Other"],
    },
    techStack: [{
      type: String,
      trim: true,
    }],
    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      default: "beginner",
    },
    githubUsername: {
      type: String,
      trim: true,
    },
    linkedinUrl: {
      type: String,
      trim: true,
    },
    portfolioUrl: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: "", // We set default to empty string so the pre-save hook can catch it
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    userType: {
      type: String,
      enum: ["student", "developer", "designer", "entrepreneur", "other"],
    },
    bannerUrl: {
      type: String,
      default: "", // New field for user banner
    },
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },
    points: {
      type: Number,
      default: 10, // Your default is 10, which is great!
      index: true,
    },
    badges: [{ type: String }],
    level: { type: Number, default: 1 },
    displayName: { type: String, trim: true },
    location: { type: String, trim: true },
    website: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    verificationTokenExpires: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    refreshTokens: [{ type: String }],
    lastLogin: { type: Date },
    loginStreak: { type: Number, default: 0 },
    lastStreakDate: { type: Date },
    referralCode: { 
      type: String, 
      unique: true, 
      sparse: true,
      index: true,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// --- START: COMBINED MIDDLEWARE ---

UserSchema.pre("save", function (next) {
  // 1. Your existing level calculation logic
  if (this.isModified("points")) {
    this.level = Math.floor(this.points / 1000) + 1;
  }

  // 2. Gender-specific DiceBear Avatar Logic
  if (this.isNew && !this.avatar) {
    const seed = this.username;
    if (this.gender === "male") {
      this.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&gender=male`;
    } else if (this.gender === "female") {
      this.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&gender=female`;
    } else {
      this.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    }
  }

  // 3. Generate referral code for new users
  if (this.isNew && !this.referralCode) {
    const timestamp = Date.now().toString(36);
    const username = this.username.substring(0, 4).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.referralCode = `${username}${timestamp}${random}`;
  }

  next(); // Continue with the save operation
});

// --- END: COMBINED MIDDLEWARE ---


// Your existing methods
UserSchema.methods.calculateLevel = function () {
  return Math.floor(this.points / 1000) + 1;
};

UserSchema.methods.cleanExpiredTokens = function () {
  // ... (your existing logic is perfect)
};

export default models.User || model<IUser>("User", UserSchema);