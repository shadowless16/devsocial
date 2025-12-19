import mongoose, { Schema, type Document } from "mongoose"

export interface IComment extends Document {
  author: mongoose.Types.ObjectId
  post: mongoose.Types.ObjectId
  parentComment?: mongoose.Types.ObjectId
  content: string
  imageUrl?: string
  mentions: string[]
  mentionIds: mongoose.Types.ObjectId[]
  likes: mongoose.Types.ObjectId[]
  likesCount: number
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    mentions: [
      {
        type: String,
        trim: true,
      },
    ],
    mentionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient querying
CommentSchema.index({ post: 1, createdAt: -1 })

export default mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema)
