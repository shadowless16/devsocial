import mongoose, { Schema, type Document } from "mongoose"

export interface IPost extends Document {
  author: mongoose.Types.ObjectId
  community?: mongoose.Types.ObjectId
  isAnonymous: boolean
  content: string
  imageUrl?: string
  imageUrls?: string[]
  videoUrls?: string[]
  tags: string[]
  tagIds: mongoose.Types.ObjectId[]
  mentions: string[]
  mentionIds: mongoose.Types.ObjectId[]
  likesCount: number
  commentsCount: number
  viewsCount: number
  xpAwarded: number
  contentHash: string | null
  imprintStatus: "none" | "pending" | "submitted" | "confirmed" | "failed" | "duplicate"
  onChainProof: {
    topicId?: string
    seq?: number
    txId?: string
    submittedAt?: Date
    confirmedAt?: Date
    retryCount?: number
  } | null
  duplicateOf?: mongoose.Types.ObjectId
  poll?: {
    question: string
    options: Array<{
      id: string
      text: string
      votes: number
      voters: mongoose.Types.ObjectId[]
    }>
    settings: {
      multipleChoice: boolean
      maxChoices?: number
      duration?: number
      showResults: "always" | "afterVote" | "afterEnd"
      allowAddOptions: boolean
    }
    endsAt?: Date
    totalVotes: number
  }
  createdAt: Date
  updatedAt: Date
}

const PostSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      default: null,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      required: function(this: IPost) {
        return !this.poll; // Content required only if no poll
      },
      maxlength: 2000,
      default: '',
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
    tagIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
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
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
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
      enum: ["none", "pending", "submitted", "confirmed", "failed", "duplicate"],
      default: "none",
    },
    onChainProof: {
      type: {
        topicId: String,
        seq: Number,
        txId: String,
        submittedAt: Date,
        confirmedAt: Date,
        retryCount: { type: Number, default: 0 },
      },
      default: null,
    },
    duplicateOf: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    poll: {
      type: {
        question: { type: String, required: true },
        options: [
          {
            id: { type: String, required: true },
            text: { type: String, required: true },
            votes: { type: Number, default: 0 },
            voters: [{ type: Schema.Types.ObjectId, ref: "User" }],
          },
        ],
        settings: {
          multipleChoice: { type: Boolean, default: false },
          maxChoices: { type: Number, default: 1 },
          duration: { type: Number },
          showResults: {
            type: String,
            enum: ["always", "afterVote", "afterEnd"],
            default: "afterVote",
          },
          allowAddOptions: { type: Boolean, default: false },
        },
        endsAt: { type: Date },
        totalVotes: { type: Number, default: 0 },
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
// Step 9: Index for duplicate detection
PostSchema.index({ contentHash: 1 }, { sparse: true })

export default (mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema)) as mongoose.Model<IPost>;
