import mongoose, { Schema, type Document } from "mongoose"

export interface IUserMention extends Document {
  post: mongoose.Types.ObjectId
  comment?: mongoose.Types.ObjectId
  mentioner: mongoose.Types.ObjectId
  mentioned: mongoose.Types.ObjectId
  createdAt: Date
}

const UserMentionSchema = new Schema<IUserMention>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      index: true,
    },
    mentioner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mentioned: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
)

UserMentionSchema.index({ mentioned: 1, createdAt: -1 })
UserMentionSchema.index({ post: 1, mentioned: 1 })

export default mongoose.models.UserMention || mongoose.model<IUserMention>("UserMention", UserMentionSchema)