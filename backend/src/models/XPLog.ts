import mongoose, { Schema, type Document } from "mongoose"

export interface IXPLog extends Document {
  userId: mongoose.Types.ObjectId
  type: string
  xpAmount: number
  refId?: mongoose.Types.ObjectId
  createdAt: Date
}

const XPLogSchema = new Schema<IXPLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "daily_login",
        "post_creation",
        "comment_creation",
        "like_given",
        "like_received",
        "first_post",
        "first_comment",
        "poll_interaction",
        "badge_earned",
        "level_up",
        "moderator_action_bonus",
        "referral_success",
        "referral_bonus",
        "email_verified",
        "user_followed",
        "challenge_completion",
      ],
      required: true,
    },
    xpAmount: {
      type: Number,
      required: true,
    },
    refId: {
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient querying
XPLogSchema.index({ userId: 1, createdAt: -1 })
XPLogSchema.index({ type: 1, createdAt: -1 })

export default mongoose.models.XPLog || mongoose.model<IXPLog>("XPLog", XPLogSchema)
