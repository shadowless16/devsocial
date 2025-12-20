import mongoose, { Schema, type Document } from 'mongoose'

export interface IFeedbackComment extends Document {
  feedbackId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  content: string
  isAdminComment: boolean
  createdAt: Date
  updatedAt: Date
}

const FeedbackCommentSchema = new Schema<IFeedbackComment>(
  {
    feedbackId: { type: Schema.Types.ObjectId, ref: 'Feedback', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 1000 },
    isAdminComment: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
)

FeedbackCommentSchema.index({ feedbackId: 1, createdAt: -1 })
FeedbackCommentSchema.index({ userId: 1 })

export default (mongoose.models.FeedbackComment || mongoose.model<IFeedbackComment>('FeedbackComment', FeedbackCommentSchema)) as mongoose.Model<IFeedbackComment>;