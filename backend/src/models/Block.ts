import mongoose from "mongoose"

const blockSchema = new mongoose.Schema({
  blocker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  blocked: {
    type: mongoose.Schema.Types.ObjectId,
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

export default mongoose.models.Block || mongoose.model("Block", blockSchema)
