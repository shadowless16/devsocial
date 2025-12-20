import mongoose, { Schema, Document } from 'mongoose'

export interface IAILog extends Document {
  service: 'mistral' | 'gemini'
  aiModel: string
  taskType: string
  inputLength: number
  outputSummary: string
  userId?: string
  success: boolean
  errorMessage?: string
  executionTime: number
  createdAt: Date
}

const AILogSchema = new Schema<IAILog>({
  service: {
    type: String,
    enum: ['mistral', 'gemini'],
    required: true,
    index: true
  },
  aiModel: {
    type: String,
    required: true
  },
  taskType: {
    type: String,
    required: true,
    index: true
  },
  inputLength: {
    type: Number,
    required: true
  },
  outputSummary: {
    type: String,
    required: true,
    maxlength: 500
  },
  userId: {
    type: String,
    index: true
  },
  success: {
    type: Boolean,
    required: true,
    default: true
  },
  errorMessage: {
    type: String
  },
  executionTime: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
})

AILogSchema.index({ createdAt: -1 })
AILogSchema.index({ service: 1, taskType: 1 })

export default (mongoose.models.AILog || mongoose.model<IAILog>('AILog', AILogSchema)) as mongoose.Model<IAILog>;
