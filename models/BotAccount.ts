import mongoose, { Schema, type Document } from 'mongoose';

export interface IBotAccount extends Document {
  userId: mongoose.Types.ObjectId
  isActive: boolean
  personality: 'friendly' | 'technical' | 'casual' | 'professional'
  commentFrequency: number
  lastActive: Date
  stats: {
    totalComments: number
    totalReplies: number
  }
  createdAt: Date
  updatedAt: Date
}

const botAccountSchema = new Schema<IBotAccount>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  personality: { type: String, enum: ['friendly', 'technical', 'casual', 'professional'], default: 'friendly' },
  commentFrequency: { type: Number, default: 5, min: 1, max: 20 },
  lastActive: { type: Date, default: Date.now },
  stats: {
    totalComments: { type: Number, default: 0 },
    totalReplies: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default (mongoose.models.BotAccount || mongoose.model<IBotAccount>('BotAccount', botAccountSchema)) as mongoose.Model<IBotAccount>;
