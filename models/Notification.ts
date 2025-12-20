import mongoose, { Schema, type Document } from 'mongoose'

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId
  sender: mongoose.Types.ObjectId
  type: 'like' | 'comment' | 'follow' | 'project_like' | 'mention' | 'system' | 'xp_overtake' | 'xp_overtaken'
  title: string
  message: string
  relatedPost?: mongoose.Types.ObjectId
  relatedProject?: mongoose.Types.ObjectId
  relatedComment?: mongoose.Types.ObjectId
  read: boolean
  actionUrl?: string
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'project_like', 'mention', 'system', 'xp_overtake', 'xp_overtaken'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  relatedPost: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  relatedProject: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  relatedComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  read: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String
  }
}, {
  timestamps: true
})

NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, read: 1 });

export default (mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)) as mongoose.Model<INotification>;