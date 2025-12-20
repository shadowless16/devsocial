import mongoose, { Schema, type Document } from 'mongoose'

export interface IReport extends Document {
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

const ReportSchema = new Schema<IReport>({
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedPost: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  reportedUser: {
    type: Schema.Types.ObjectId,
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
    type: Schema.Types.ObjectId,
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

export default (mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema)) as mongoose.Model<IReport>;