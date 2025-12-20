import mongoose, { Schema, type Document } from 'mongoose'

export interface ILeaderboardSnapshot extends Document {
  userId: mongoose.Types.ObjectId
  rank: number
  totalXP: number
  type: 'all-time' | 'weekly' | 'monthly'
  createdAt: Date
  updatedAt: Date
}

const LeaderboardSnapshotSchema = new Schema<ILeaderboardSnapshot>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rank: {
    type: Number,
    required: true
  },
  totalXP: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['all-time', 'weekly', 'monthly'],
    default: 'all-time'
  }
}, {
  timestamps: true
})

LeaderboardSnapshotSchema.index({ userId: 1, type: 1 })
LeaderboardSnapshotSchema.index({ createdAt: -1 })

export default (mongoose.models.LeaderboardSnapshot || mongoose.model<ILeaderboardSnapshot>('LeaderboardSnapshot', LeaderboardSnapshotSchema)) as mongoose.Model<ILeaderboardSnapshot>;
