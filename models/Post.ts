import mongoose, { Schema, type Document } from "mongoose"

export interface IPost extends Document {
  author: mongoose.Types.ObjectId
  isAnonymous: boolean
  content: string
  imageUrl?: string
  imageUrls?: string[]
  videoUrls?: string[]
  tags: string[]
  likesCount: number
  commentsCount: number
  viewsCount: number
  xpAwarded: number
  contentHash: string | null
  imprintStatus: "none" | "pending" | "submitted" | "confirmed" | "failed"
  onChainProof: {
    topicId?: string
    seq?: number
    txId?: string
    submittedAt?: Date
    confirmedAt?: Date
  } | null
  createdAt: Date
  updatedAt: Date
}

const PostSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    imageUrls: [
      {
        type: String,
      },
    ],
    videoUrls: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
      index: true,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
      index: true,
    },
    xpAwarded: {
      type: Number,
      default: 20, // Default XP for creating a post
    },
    contentHash: {
      type: String,
      default: null,
    },
    imprintStatus: {
      type: String,
      enum: ["none", "pending", "submitted", "confirmed", "failed"],
      default: "none",
    },
    onChainProof: {
      type: {
        topicId: String,
        seq: Number,
        txId: String,
        submittedAt: Date,
        confirmedAt: Date,
      },
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient querying
PostSchema.index({ createdAt: -1 })
PostSchema.index({ tags: 1 })
PostSchema.index({ author: 1, createdAt: -1 })

export default mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema)
