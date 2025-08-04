import mongoose, { Schema, type Document } from "mongoose"

export interface ILike extends Document {
  user: mongoose.Types.ObjectId
  post: mongoose.Types.ObjectId
  comment?: mongoose.Types.ObjectId
  createdAt: Date
}

const LikeSchema = new Schema<ILike>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  },
  {
    timestamps: true,
  },
)

// Create separate unique indexes for post and comment likes
// Index for post likes (when comment is not set)
LikeSchema.index(
  { user: 1, post: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { post: { $exists: true } }
  }
)

// Index for comment likes (when comment is set)
LikeSchema.index(
  { user: 1, comment: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { comment: { $exists: true } }
  }
)

export default mongoose.models.Like || mongoose.model<ILike>("Like", LikeSchema)
