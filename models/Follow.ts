import mongoose, { Schema, type Document } from "mongoose"

export interface IFollow extends Document {
  follower: mongoose.Types.ObjectId
  following: mongoose.Types.ObjectId
  createdAt: Date
}

const followSchema = new Schema<IFollow>({
  follower: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  following: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Unique compound index to prevent duplicate follows
followSchema.index({ follower: 1, following: 1 }, { unique: true })

// Performance indexes for queries
followSchema.index({ follower: 1 })
followSchema.index({ following: 1 })

export default (mongoose.models.Follow || mongoose.model<IFollow>("Follow", followSchema)) as mongoose.Model<IFollow>;
