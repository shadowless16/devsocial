import mongoose, { Schema, type Document } from "mongoose"

export interface ILike extends Document {
  user: mongoose.Types.ObjectId
  post?: mongoose.Types.ObjectId
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

// Validation: Either post or comment must be present, but not both
LikeSchema.pre('save', function() {
  if (!this.post && !this.comment) {
    throw new Error('Either post or comment must be specified');
  }
  if (this.post && this.comment) {
    throw new Error('Cannot like both post and comment simultaneously');
  }
});

// Create separate unique indexes for post and comment likes
// Index for post likes (sparse to ignore null values)
LikeSchema.index(
  { user: 1, post: 1 }, 
  { 
    unique: true,
    sparse: true
  }
)

// Index for comment likes (sparse to ignore null values)
LikeSchema.index(
  { user: 1, comment: 1 }, 
  { 
    unique: true,
    sparse: true
  }
)

// Additional indexes for performance
LikeSchema.index({ post: 1 })
LikeSchema.index({ comment: 1 })
LikeSchema.index({ user: 1 })

export default mongoose.models.Like || mongoose.model<ILike>("Like", LikeSchema)
