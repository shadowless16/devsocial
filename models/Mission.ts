import mongoose, { Schema, type Document } from "mongoose"

export interface IMission extends Document {
  title: string
  description: string
  type: "social" | "content" | "engagement" | "learning" | "achievement"
  difficulty: "beginner" | "intermediate" | "advanced" | "expert"
  duration: "daily" | "weekly" | "monthly" | "permanent"
  steps: {
    id: string
    title: string
    description: string
    target: number
    metric: string
    completed: boolean
  }[]
  rewards: {
    xp: number
    badge?: string
    title?: string
    specialReward?: string
  }
  prerequisites?: string[]
  isActive: boolean
  participantCount: number
  completionCount: number
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const MissionSchema = new Schema<IMission>(
  {
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ["social", "content", "engagement", "learning", "achievement"],
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      required: true,
      index: true,
    },
    duration: {
      type: String,
      enum: ["daily", "weekly", "monthly", "permanent"],
      required: true,
      index: true,
    },
    steps: [{
      id: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      target: { type: Number, required: true },
      metric: { type: String, required: true },
      completed: { type: Boolean, default: false }
    }],
    rewards: {
      xp: { type: Number, required: true },
      badge: String,
      title: String,
      specialReward: String,
    },
    prerequisites: [String],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    participantCount: {
      type: Number,
      default: 0,
    },
    completionCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
)

MissionSchema.index({ isActive: 1, type: 1, difficulty: 1 })
MissionSchema.index({ duration: 1, isActive: 1 })

export default mongoose.models.Mission || mongoose.model<IMission>("Mission", MissionSchema)