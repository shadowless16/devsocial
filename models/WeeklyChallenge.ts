import mongoose, { Schema, type Document } from "mongoose"

export interface IWeeklyChallenge extends Document {
  title: string
  description: string
  type: "post_creation" | "engagement" | "community" | "learning" | "creative"
  difficulty: "easy" | "medium" | "hard"
  requirements: {
    target: number
    metric: string
    description: string
  }
  rewards: {
    xp: number
    badge?: string
    title?: string
  }
  techStack?: string[]
  experienceLevel?: "beginner" | "intermediate" | "advanced" | "expert"
  tags?: string[]
  startDate: Date
  endDate: Date
  isActive: boolean
  participantCount: number
  completionCount: number
  firstCompletionBonus: number
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const WeeklyChallengeSchema = new Schema<IWeeklyChallenge>(
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
      enum: ["post_creation", "engagement", "community", "learning", "creative"],
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
      index: true,
    },
    requirements: {
      target: {
        type: Number,
        required: true,
      },
      metric: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },
    rewards: {
      xp: {
        type: Number,
        required: true,
      },
      badge: String,
      title: String,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
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
    firstCompletionBonus: {
      type: Number,
      default: 10,
    },
    techStack: [{
      type: String,
      trim: true,
    }],
    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
    },
    tags: [{
      type: String,
      trim: true,
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Compound indexes
WeeklyChallengeSchema.index({ isActive: 1, startDate: 1, endDate: 1 })
WeeklyChallengeSchema.index({ type: 1, difficulty: 1, isActive: 1 })

export default mongoose.models.WeeklyChallenge ||
  mongoose.model<IWeeklyChallenge>("WeeklyChallenge", WeeklyChallengeSchema)
