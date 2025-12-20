import mongoose, { Schema, type Document } from 'mongoose';

export interface IBotActivity extends Document {
  botAccountId: mongoose.Types.ObjectId
  postId: mongoose.Types.ObjectId
  commentId?: mongoose.Types.ObjectId
  action: 'comment' | 'reply'
  content: string
  createdAt: Date
  updatedAt: Date
}

const botActivitySchema = new Schema<IBotActivity>({
  botAccountId: { type: Schema.Types.ObjectId, ref: 'BotAccount', required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  commentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
  action: { type: String, enum: ['comment', 'reply'], required: true },
  content: { type: String, required: true }
}, { timestamps: true });

botActivitySchema.index({ botAccountId: 1, postId: 1 });

export default (mongoose.models.BotActivity || mongoose.model<IBotActivity>('BotActivity', botActivitySchema)) as mongoose.Model<IBotActivity>;
