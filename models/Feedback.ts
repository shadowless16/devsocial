import mongoose from 'mongoose'

const FeedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: ['bug', 'feature', 'general', 'improvement'] },
    subject: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5 },
    status: { type: String, default: 'open', enum: ['open', 'in-progress', 'solved'] },
    commentsCount: { type: Number, default: 0 },
    solvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    solvedAt: { type: Date }
  },
  {
    timestamps: true
  }
)

FeedbackSchema.index({ userId: 1, createdAt: -1 })

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema)

export default Feedback
