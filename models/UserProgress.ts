import mongoose, { Schema, Document } from 'mongoose'

export interface IModuleProgress {
  moduleId: string
  completedAt?: Date
  quizScore?: number
  timeSpent: number // in minutes
}

export interface IUserProgress extends Document {
  userId: string
  pathId: string
  startedAt: Date
  lastAccessedAt: Date
  completedAt?: Date
  currentModuleId?: string
  moduleProgress: IModuleProgress[]
  totalXpEarned: number
  totalTimeSpent: number // in minutes
  completionPercentage: number
  createdAt: Date
  updatedAt: Date
}

const ModuleProgressSchema = new Schema<IModuleProgress>({
  moduleId: { type: Schema.Types.ObjectId as any, ref: 'Module', required: true },
  completedAt: { type: Date },
  quizScore: { type: Number },
  timeSpent: { type: Number, default: 0 }
})

const UserProgressSchema = new Schema<IUserProgress>({
  userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true },
  pathId: { type: Schema.Types.ObjectId as any, ref: 'CareerPath', required: true },
  startedAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  currentModuleId: { type: Schema.Types.ObjectId, ref: 'Module' },
  moduleProgress: [ModuleProgressSchema],
  totalXpEarned: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 },
  completionPercentage: { type: Number, default: 0 }
}, {
  timestamps: true
})

// Compound index for efficient queries
UserProgressSchema.index({ userId: 1, pathId: 1 }, { unique: true })

export default mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema)