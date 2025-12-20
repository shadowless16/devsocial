import mongoose, { Schema, type Document } from "mongoose"

export interface IBlock extends Document {
  blocker: mongoose.Types.ObjectId
  blocked: mongoose.Types.ObjectId
  reason: "spam" | "harassment" | "inappropriate" | "other"
  createdAt: Date
}

const blockSchema = new Schema<IBlock>({
  blocker: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  blocked: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    enum: ["spam", "harassment", "inappropriate", "other"],
    default: "other",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Compound index to prevent duplicate blocks and optimize queries
blockSchema.index({ blocker: 1, blocked: 1 }, { unique: true })
blockSchema.index({ blocker: 1 })
blockSchema.index({ blocked: 1 })

export default (mongoose.models.Block || mongoose.model<IBlock>("Block", blockSchema)) as mongoose.Model<IBlock>;
