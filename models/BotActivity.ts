import mongoose from 'mongoose';

const botActivitySchema = new mongoose.Schema({
  botAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'BotAccount', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  action: { type: String, enum: ['comment', 'reply'], required: true },
  content: { type: String, required: true }
}, { timestamps: true });

botActivitySchema.index({ botAccountId: 1, postId: 1 });

export default mongoose.models.BotActivity || mongoose.model('BotActivity', botActivitySchema);
