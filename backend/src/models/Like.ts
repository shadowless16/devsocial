import mongoose, { Schema, type Document } from "mongoose"

export interface ILike extends Document {
  user: mongoose.Types.ObjectId
  targetId: mongoose.Types.ObjectId
  targetType: 'post' | 'comment'
  createdAt: Date
}

const LikeSchema = new Schema<ILike>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ['post', 'comment'],
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Unique compound index to prevent duplicate likes
LikeSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true })

// Performance indexes for queries
LikeSchema.index({ targetId: 1, targetType: 1 })

export default mongoose.models.Like || mongoose.model<ILike>("Like", LikeSchema)
