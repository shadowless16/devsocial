import mongoose, { Schema, type Document } from "mongoose"

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId
  recipient: mongoose.Types.ObjectId
  content: string
  messageType: "text" | "image" | "file"
  fileUrl?: string
  fileName?: string
  fileSize?: number
  replyTo?: mongoose.Types.ObjectId
  reactions: Array<{
    user: mongoose.Types.ObjectId
    emoji: string
    createdAt: Date
  }>
  readBy: Array<{
    user: mongoose.Types.ObjectId
    readAt: Date
  }>
  isDeleted: boolean
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: null,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    reactions: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        emoji: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    readBy: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for efficient queries
MessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 })
MessageSchema.index({ recipient: 1, createdAt: -1 })
MessageSchema.index({ "readBy.user": 1 })

export default (mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema)) as mongoose.Model<IMessage>;
