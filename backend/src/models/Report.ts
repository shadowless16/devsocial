import mongoose from 'mongoose'

const ReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'inappropriate', 'misinformation', 'copyright', 'other'],
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  action: {
    type: String,
    enum: ['none', 'warning', 'post_removed', 'user_suspended', 'user_banned']
  }
}, {
  timestamps: true
})

ReportSchema.index({ reportedPost: 1 })
ReportSchema.index({ reporter: 1 })
ReportSchema.index({ status: 1 })
ReportSchema.index({ createdAt: -1 })

export interface IReport extends mongoose.Document {
  reporter: mongoose.Types.ObjectId
  reportedPost: mongoose.Types.ObjectId
  reportedUser: mongoose.Types.ObjectId
  reason: 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'copyright' | 'other'
  description?: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reviewedBy?: mongoose.Types.ObjectId
  reviewedAt?: Date
  action?: 'none' | 'warning' | 'post_removed' | 'user_suspended' | 'user_banned'
  createdAt: Date
  updatedAt: Date
}

const Report: mongoose.Model<IReport> = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema)

export default Report
