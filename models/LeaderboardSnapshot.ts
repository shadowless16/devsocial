import mongoose from 'mongoose'

const LeaderboardSnapshotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
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

export default mongoose.models.LeaderboardSnapshot || mongoose.model('LeaderboardSnapshot', LeaderboardSnapshotSchema)
