import mongoose, { Schema, Document } from 'mongoose'

export interface ISkillAssessment {
  question: string
  options: string[]
  correctAnswer: number
  skillArea: string
  weight: number
}

export interface ICareerPath extends Document {
  title: string
  slug: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedHours: number
  icon: string
  color: string
  modules: string[] // Module IDs
  prerequisites: string[]
  tags: string[]
  skillAssessment?: {
    questions: ISkillAssessment[]
    passingScore: number
    skillAreas: string[]
  }
  learningOutcomes: string[]
  targetAudience: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const SkillAssessmentSchema = new Schema<ISkillAssessment>({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  skillArea: { type: String, required: true },
  weight: { type: Number, default: 1 }
})

const CareerPathSchema = new Schema<ICareerPath>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'], 
    required: true 
  },
  estimatedHours: { type: Number, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
  prerequisites: [{ type: String }],
  tags: [{ type: String }],
  skillAssessment: {
    questions: [SkillAssessmentSchema],
    passingScore: { type: Number, default: 70 },
    skillAreas: [{ type: String }]
  },
  learningOutcomes: [{ type: String }],
  targetAudience: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
})

export default mongoose.models.CareerPath || mongoose.model<ICareerPath>('CareerPath', CareerPathSchema)