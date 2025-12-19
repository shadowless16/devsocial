import mongoose, { Schema, Document } from 'mongoose'

export interface IKnowledgeEntry extends Document {
  title: string
  technology: string
  category: string
  content: string
  codeExample?: string
  tags: string[]
  author: mongoose.Types.ObjectId
  likes: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const KnowledgeEntrySchema = new Schema<IKnowledgeEntry>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  technology: {
    type: String,
    required: true,
    enum: [
      'MongoDB', 'JavaScript', 'TypeScript', 'React', 'Next.js',
      'Node.js', 'Python', 'Java', 'HTML/CSS', 'PHP', 'C++',
      'C#', 'Go', 'Rust', 'Swift', 'Kotlin', 'Vue.js', 'Angular',
      'Express.js', 'Django', 'Flask', 'Spring', 'Laravel'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Tutorial', 'Code Snippet', 'Best Practice', 'Troubleshooting',
      'Configuration', 'API Reference', 'Command Reference', 'Quick Tip'
    ]
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  codeExample: {
    type: String,
    maxlength: 10000
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
})

// Indexes for better query performance
KnowledgeEntrySchema.index({ technology: 1, createdAt: -1 })
KnowledgeEntrySchema.index({ tags: 1 })
KnowledgeEntrySchema.index({ title: 'text', content: 'text', tags: 'text' })
KnowledgeEntrySchema.index({ author: 1, createdAt: -1 })

// Virtual for likes count
KnowledgeEntrySchema.virtual('likesCount').get(function() {
  return this.likes.length
})

// Ensure virtual fields are serialized
KnowledgeEntrySchema.set('toJSON', { virtuals: true })

const KnowledgeEntry: mongoose.Model<IKnowledgeEntry> = mongoose.models.KnowledgeEntry || mongoose.model<IKnowledgeEntry>('KnowledgeEntry', KnowledgeEntrySchema)

export default KnowledgeEntry
