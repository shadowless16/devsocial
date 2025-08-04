import mongoose, { Schema, type Document } from "mongoose"

export interface IChallengeParticipation extends Document {
  user: mongoose.Types.ObjectId
  challenge: mongoose.Types.ObjectId
  status: "active" | "completed" | "failed"
  progress: number
  completedAt?: Date
  isFirstCompletion: boolean
  xpEarned: number
  submissionData?: any
  createdAt: Date
  updatedAt: Date
}

const ChallengeParticipationSchema = new Schema<IChallengeParticipation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    challenge: {
      type: Schema.Types.ObjectId,
      ref: "WeeklyChallenge",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "failed"],
      default: "active",
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedAt: {
      type: Date,
    },
    isFirstCompletion: {
      type: Boolean,
      default: false,
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
    submissionData: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
)

// Compound indexes
ChallengeParticipationSchema.index({ user: 1, challenge: 1 }, { unique: true })
ChallengeParticipationSchema.index({ challenge: 1, status: 1 })
ChallengeParticipationSchema.index({ user: 1, status: 1 })

export default mongoose.models.ChallengeParticipation ||
  mongoose.model<IChallengeParticipation>("ChallengeParticipation", ChallengeParticipationSchema)
