import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'project_like', 'mention', 'system'],
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  relatedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  relatedComment: {
    type: mongoose.Schema.Types.ObjectId,
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

NotificationSchema.index({ recipient: 1, createdAt: -1 })
NotificationSchema.index({ read: 1 })

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema)