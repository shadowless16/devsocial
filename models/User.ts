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
  role: "user" | "moderator" | "admin" | "analytics";
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
  followersCount: number;
  followingCount: number;
  lastActive?: Date;
  sessionStart?: Date;
  registrationSource?: string;
  referrer?: string;
  country?: string;
  isGenerated?: boolean;
  hederaAccountId?: string;
  walletConnected?: boolean;
  demoWalletBalance: number;
  summaryUsage?: { [key: string]: number }; // Track monthly summary usage
  transcriptionUsage?: { [key: string]: number }; // Track monthly audio transcription usage
  imageAnalysisUsage?: { [key: string]: number }; // Track monthly image analysis usage
  aiUsage?: {
    explain?: Array<{ date: Date; contentLength: number }>;
  }; // Track AI feature usage
  isPremium?: boolean; // Premium subscription status
  pushSubscription?: unknown; // Push notification subscription
  isBlocked?: boolean; // User blocked status
  appearanceSettings?: {
    theme?: "light" | "dark" | "system";
    fontSize?: "small" | "medium" | "large";
    compactMode?: boolean;
    highContrast?: boolean;
    reducedMotion?: boolean;
    colorScheme?: "default" | "blue" | "green" | "purple" | "orange";
    sidebarCollapsed?: boolean;
    showAvatars?: boolean;
  };
  privacySettings?: {
    profileVisibility?: "public" | "followers" | "private";
    showEmail?: boolean;
    showLocation?: boolean;
    showActivity?: boolean;
    showStats?: boolean;
    allowMessages?: "everyone" | "followers" | "none";
    allowMentions?: "everyone" | "followers" | "none";
    showOnlineStatus?: boolean;
    indexProfile?: boolean;
  };
  notificationSettings?: {
    emailLikes: boolean;
    emailComments: boolean;
    emailFollows: boolean;
    emailMentions: boolean;
    emailMessages: boolean;
    emailTips: boolean;
  };
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
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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
      enum: ["user", "moderator", "admin", "analytics"],
      default: "user",
    },
    points: {
      type: Number,
      default: 10, // Your default is 10, which is great!
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
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    sessionStart: {
      type: Date,
      default: Date.now,
    },
    registrationSource: {
      type: String,
      enum: ['organic', 'referral', 'social', 'direct', 'email', 'search'],
      default: 'direct'
    },
    referrer: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      trim: true,
    },
    isGenerated: {
      type: Boolean,
      default: false,
    },
    hederaAccountId: {
      type: String,
      trim: true,
      sparse: true,
    },
    walletConnected: {
      type: Boolean,
      default: false,
    },
    demoWalletBalance: {
      type: Number,
      default: 100, // Each user starts with 100 demo HBAR
      min: 0,
    },
    summaryUsage: {
      type: Map,
      of: Number,
      default: {},
    },
    transcriptionUsage: {
      type: Map,
      of: Number,
      default: {},
    },
    imageAnalysisUsage: {
      type: Map,
      of: Number,
      default: {},
    },
    aiUsage: {
      explain: [{
        date: { type: Date, required: true },
        contentLength: { type: Number, required: true }
      }]
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    pushSubscription: {
      type: Schema.Types.Mixed,
      required: false,
    },
    appearanceSettings: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      fontSize: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
      compactMode: {
        type: Boolean,
        default: false,
      },
      highContrast: {
        type: Boolean,
        default: false,
      },
      reducedMotion: {
        type: Boolean,
        default: false,
      },
      colorScheme: {
        type: String,
        enum: ["default", "blue", "green", "purple", "orange"],
        default: "default",
      },
      sidebarCollapsed: {
        type: Boolean,
        default: false,
      },
      showAvatars: {
        type: Boolean,
        default: true,
      },
    },
    privacySettings: {
      profileVisibility: {
        type: String,
        enum: ["public", "followers", "private"],
        default: "public",
      },
      showEmail: {
        type: Boolean,
        default: false,
      },
      showLocation: {
        type: Boolean,
        default: true,
      },
      showActivity: {
        type: Boolean,
        default: true,
      },
      showStats: {
        type: Boolean,
        default: true,
      },
      allowMessages: {
        type: String,
        enum: ["everyone", "followers", "none"],
        default: "followers",
      },
      allowMentions: {
        type: String,
        enum: ["everyone", "followers", "none"],
        default: "everyone",
      },
      showOnlineStatus: {
        type: Boolean,
        default: true,
      },
      indexProfile: {
        type: Boolean,
        default: true,
      },
    },
    notificationSettings: {
      emailLikes: { type: Boolean, default: true },
      emailComments: { type: Boolean, default: true },
      emailFollows: { type: Boolean, default: true },
      emailMentions: { type: Boolean, default: true },
      emailMessages: { type: Boolean, default: true },
      emailTips: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// --- START: COMBINED MIDDLEWARE ---
// Small helper to normalize ReadyPlayerMe urls to png
function normalizeReadyPlayerMe(avatar?: string) {
  if (!avatar) return avatar || '';
  let url = avatar.trim();
  url = url.replace(/^['"]+|['"]+$/g, '');
  if (url.includes('models.readyplayer.me')) {
    const baseUrl = url.split('?')[0];
    return baseUrl.replace(/\.glb$/i, '.png');
  }
  return url;
}

UserSchema.pre("save", function () {
  // 1. Level calculation logic
  if (this.isModified("points")) {
    this.level = Math.floor(this.points / 1000) + 1;
  }

  // 2. Ensure avatar field is always a string (empty for DiceBear generation)
  if (this.isNew && !this.avatar) {
    this.avatar = ''; // Empty string - frontend will generate DiceBear
    // Note: isGenerated should ONLY be true for bot/fake users, not real users with DiceBear avatars
  }
  
  // Normalize avatar if changed or present
  if (this.isModified('avatar') && this.avatar) {
    this.avatar = normalizeReadyPlayerMe(this.avatar);
  }

  // 3. Generate referral code for new users
  if (this.isNew && !this.referralCode) {
    const timestamp = Date.now().toString(36);
    const username = this.username.substring(0, 4).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.referralCode = `${username}${timestamp}${random}`;
  }
});

// --- END: COMBINED MIDDLEWARE ---


// Performance indexes
UserSchema.index({ points: -1 }); // For leaderboards
UserSchema.index({ lastActive: -1 }); // For active users
UserSchema.index({ followersCount: -1 }); // For popular users
UserSchema.index({ onboardingCompleted: 1 }); // For filtering

// Your existing methods
UserSchema.methods.calculateLevel = function () {
  return Math.floor(this.points / 1000) + 1;
};

UserSchema.methods.cleanExpiredTokens = function () {
  // ... (your existing logic is perfect)
};

export default (models.User || model<IUser>("User", UserSchema)) as mongoose.Model<IUser>;