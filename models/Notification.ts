import mongoose, { Schema, type Document } from "mongoose"

export interface INotification extends Document {
  _id: string
  recipient: mongoose.Types.ObjectId
  sender?: mongoose.Types.ObjectId
  type: "like" | "comment" | "mention" | "follow" | "achievement" | "system" | "message"
  title: string
  message: string
  data?: any
  isRead: boolean
  readAt?: Date
  actionUrl?: string
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: ["like", "comment", "mention", "follow", "achievement", "system", "message"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    data: {
      type: Schema.Types.Mixed,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    actionUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for efficient queries
NotificationSchema.index({ recipient: 1, createdAt: -1 })
NotificationSchema.index({ recipient: 1, isRead: 1 })

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema)
