import mongoose from 'mongoose';

const botAccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  personality: { type: String, enum: ['friendly', 'technical', 'casual', 'professional'], default: 'friendly' },
  commentFrequency: { type: Number, default: 5, min: 1, max: 20 }, // comments per run
  lastActive: { type: Date, default: Date.now },
  stats: {
    totalComments: { type: Number, default: 0 },
    totalReplies: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.models.BotAccount || mongoose.model('BotAccount', botAccountSchema);
