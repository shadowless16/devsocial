import mongoose, { Schema, type Document } from "mongoose"

export interface IUserProfile extends Document {
  user: mongoose.Types.ObjectId
  title?: string
  bio?: string
  location?: string
  techStack: string[]
  socialLinks: {
    platform: string
    url: string
  }[]
  skills: {
    name: string
    level: number
    projectsCompleted: number
    recentGain: number
    nextMilestone: string
    xpToNext: number
  }[]
  privacySettings: {
    profileVisibility: boolean
    showEmail: boolean
    showLocation: boolean
    showActivity: boolean
    allowMessages: boolean
    showStats: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      maxlength: 100,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    location: {
      type: String,
      maxlength: 100,
    },
    techStack: [{
      type: String,
      trim: true,
    }],
    socialLinks: [{
      platform: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      }
    }],
    skills: [{
      name: {
        type: String,
        required: true,
      },
      level: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      projectsCompleted: {
        type: Number,
        default: 0,
      },
      recentGain: {
        type: Number,
        default: 0,
      },
      nextMilestone: {
        type: String,
        default: "Beginner Level",
      },
      xpToNext: {
        type: Number,
        default: 100,
      }
    }],
    privacySettings: {
      profileVisibility: {
        type: Boolean,
        default: true,
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
      allowMessages: {
        type: Boolean,
        default: true,
      },
      showStats: {
        type: Boolean,
        default: true,
      }
    }
  },
  { timestamps: true }
)

export default (mongoose.models.UserProfile || mongoose.model<IUserProfile>("UserProfile", UserProfileSchema)) as mongoose.Model<IUserProfile>;