import mongoose, { Schema, type Document } from 'mongoose'

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId
  type: 'bug' | 'feature' | 'general' | 'improvement'
  subject: string
  description: string
  rating?: number
  status: 'open' | 'in-progress' | 'solved'
  commentsCount: number
  solvedBy?: mongoose.Types.ObjectId
  solvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: ['bug', 'feature', 'general', 'improvement'] },
    subject: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5 },
    status: { type: String, default: 'open', enum: ['open', 'in-progress', 'solved'] },
    commentsCount: { type: Number, default: 0 },
    solvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    solvedAt: { type: Date }
  },
  {
    timestamps: true
  }
)

FeedbackSchema.index({ userId: 1, createdAt: -1 })

export default (mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema)) as mongoose.Model<IFeedback>;
