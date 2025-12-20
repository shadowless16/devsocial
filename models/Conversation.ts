import mongoose, { Schema, type Document } from "mongoose"

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[]
  lastMessage: mongoose.Types.ObjectId
  lastActivity: Date
  unreadCount: Map<string, number>
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Ensure unique conversations between participants
ConversationSchema.index({ participants: 1 }, { unique: true })
ConversationSchema.index({ lastActivity: -1 })

export default (mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", ConversationSchema)) as mongoose.Model<IConversation>;
