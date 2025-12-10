import mongoose, { Schema, Document } from 'mongoose'

export interface ICodeExample {
  language: string
  code: string
  description?: string
  isInteractive?: boolean
  expectedOutput?: string
}

export interface IQuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export interface IExternalResource {
  title: string
  url: string
  type: 'documentation' | 'tutorial' | 'video' | 'tool' | 'reference'
  description?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export interface IPracticeExercise {
  title: string
  description: string
  instructions: string[]
  starterCode?: string
  solution?: string
  hints?: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface IContentSection {
  type: 'text' | 'code' | 'video' | 'interactive' | 'exercise'
  title: string
  content: string
  order: number
  metadata?: unknown
}

export interface IPrerequisite {
  skill: string
  level: 'basic' | 'intermediate' | 'advanced'
  optional: boolean
}

export interface IModule extends Document {
  title: string
  slug: string
  description: string
  content: string // Markdown content
  contentSections: IContentSection[]
  order: number
  pathId: string
  codeExamples: ICodeExample[]
  externalResources: IExternalResource[]
  practiceExercises: IPracticeExercise[]
  prerequisites: IPrerequisite[]
  skillsLearned: string[]
  quiz?: {
    questions: IQuizQuestion[]
    passingScore: number
  }
  xpReward: number
  estimatedMinutes: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  canSkip: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CodeExampleSchema = new Schema<ICodeExample>({
  language: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String },
  isInteractive: { type: Boolean, default: false },
  expectedOutput: { type: String }
})

const ExternalResourceSchema = new Schema<IExternalResource>({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['documentation', 'tutorial', 'video', 'tool', 'reference'], required: true },
  description: { type: String },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] }
})

const PracticeExerciseSchema = new Schema<IPracticeExercise>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructions: [{ type: String }],
  starterCode: { type: String },
  solution: { type: String },
  hints: [{ type: String }],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true }
})

const ContentSectionSchema = new Schema<IContentSection>({
  type: { type: String, enum: ['text', 'code', 'video', 'interactive', 'exercise'], required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  order: { type: Number, required: true },
  metadata: { type: Schema.Types.Mixed }
})

const PrerequisiteSchema = new Schema<IPrerequisite>({
  skill: { type: String, required: true },
  level: { type: String, enum: ['basic', 'intermediate', 'advanced'], required: true },
  optional: { type: Boolean, default: false }
})

const QuizQuestionSchema = new Schema<IQuizQuestion>({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String }
})

const ModuleSchema = new Schema<IModule>({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  contentSections: [ContentSectionSchema],
  order: { type: Number, required: true },
  pathId: { type: Schema.Types.ObjectId as any, ref: 'CareerPath', required: true },
  codeExamples: [CodeExampleSchema],
  externalResources: [ExternalResourceSchema],
  practiceExercises: [PracticeExerciseSchema],
  prerequisites: [PrerequisiteSchema],
  skillsLearned: [{ type: String }],
  quiz: {
    questions: [QuizQuestionSchema],
    passingScore: { type: Number, default: 70 }
  },
  xpReward: { type: Number, default: 50 },
  estimatedMinutes: { type: Number, required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  canSkip: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
})

export default mongoose.models.Module || mongoose.model<IModule>('Module', ModuleSchema)