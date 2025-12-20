import mongoose, { Schema, type Document } from 'mongoose'

export interface IProject extends Document {
  title: string
  description: string
  author: mongoose.Types.ObjectId
  technologies: string[]
  githubUrl?: string
  liveUrl?: string
  images: string[]
  openPositions: Array<{
    title?: string
    description?: string
    requirements?: string[]
    applicants: Array<{
      user: mongoose.Types.ObjectId
      appliedAt: Date
      status: 'pending' | 'accepted' | 'rejected'
    }>
  }>
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold'
  visibility: 'public' | 'private'
  likes: mongoose.Types.ObjectId[]
  views: number
  viewedBy: mongoose.Types.ObjectId[]
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 4500
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  technologies: [{
    type: String,
    trim: true
  }],
  githubUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https:\/\/github\.com\//.test(v)
      },
      message: 'Must be a valid GitHub URL'
    }
  },
  liveUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\//.test(v)
      },
      message: 'Must be a valid URL'
    }
  },
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\//.test(v)
      },
      message: 'Must be a valid image URL'
    }
  }],
  openPositions: [{
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    requirements: [{
      type: String,
      trim: true
    }],
    applicants: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      appliedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
      }
    }]
  }],
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold'],
    default: 'in-progress'
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  viewedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

ProjectSchema.index({ author: 1, createdAt: -1 })
ProjectSchema.index({ technologies: 1 })
ProjectSchema.index({ status: 1 })
ProjectSchema.index({ featured: -1, createdAt: -1 })

export default (mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema)) as mongoose.Model<IProject>;