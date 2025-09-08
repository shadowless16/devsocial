import mongoose from 'mongoose'

const FeedbackCommentSchema = new mongoose.Schema(
  {
    feedbackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Feedback', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 1000 },
    isAdminComment: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
)

FeedbackCommentSchema.index({ feedbackId: 1, createdAt: -1 })
FeedbackCommentSchema.index({ userId: 1 })

const FeedbackComment = mongoose.models.FeedbackComment || mongoose.model('FeedbackComment', FeedbackCommentSchema)

export default FeedbackComment