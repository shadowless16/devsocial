import mongoose, { Schema, type Document } from "mongoose"

export interface IActivity extends Document {
  user: mongoose.Types.ObjectId
  type: "post_created" | "comment_created" | "like_given" | "user_followed" | "badge_earned" | "level_up"
  description: string
  metadata: unknown
  xpEarned?: number
  createdAt: Date
}

const ActivitySchema = new Schema<IActivity>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["post_created", "comment_created", "like_given", "user_followed", "badge_earned", "level_up"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for efficient queries
ActivitySchema.index({ user: 1, createdAt: -1 })
ActivitySchema.index({ type: 1, createdAt: -1 })

export default mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema)
