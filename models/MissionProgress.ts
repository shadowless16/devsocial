import mongoose, { Schema, type Document } from "mongoose"

export interface IMissionProgress extends Document {
  user: mongoose.Types.ObjectId
  mission: mongoose.Types.ObjectId
  status: "active" | "completed" | "paused"
  currentStep: number
  stepsCompleted: string[]
  progress: {
    stepId: string
    current: number
    target: number
    completed: boolean
  }[]
  startedAt: Date
  completedAt?: Date
  xpEarned: number
  createdAt: Date
  updatedAt: Date
}

const MissionProgressSchema = new Schema<IMissionProgress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mission: {
      type: Schema.Types.ObjectId,
      ref: "Mission",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused"],
      default: "active",
      index: true,
    },
    currentStep: {
      type: Number,
      default: 0,
    },
    stepsCompleted: [String],
    progress: [{
      stepId: { type: String, required: true },
      current: { type: Number, default: 0 },
      target: { type: Number, required: true },
      completed: { type: Boolean, default: false }
    }],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    xpEarned: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

MissionProgressSchema.index({ user: 1, mission: 1 }, { unique: true })
MissionProgressSchema.index({ user: 1, status: 1 })
MissionProgressSchema.index({ mission: 1, status: 1 })

export default mongoose.models.MissionProgress || mongoose.model<IMissionProgress>("MissionProgress", MissionProgressSchema)