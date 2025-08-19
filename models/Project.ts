import mongoose from 'mongoose'

const ProjectSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
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

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema)