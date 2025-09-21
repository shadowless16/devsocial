// TypeScript interfaces for Career Paths feature

export interface CareerPath {
  _id: string
  title: string
  slug: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedHours: number
  icon: string
  color: string
  modules: string[]
  prerequisites: string[]
  tags: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CodeExample {
  language: string
  code: string
  description?: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export interface Quiz {
  questions: QuizQuestion[]
  passingScore: number
}

export interface Module {
  _id: string
  title: string
  slug: string
  description: string
  content: string
  order: number
  pathId: string
  codeExamples: CodeExample[]
  quiz?: Quiz
  xpReward: number
  estimatedMinutes: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ModuleProgress {
  moduleId: string
  completedAt?: string
  quizScore?: number
  timeSpent: number
}

export interface UserProgress {
  _id: string
  userId: string
  pathId: string
  startedAt: string
  lastAccessedAt: string
  completedAt?: string
  currentModuleId?: string
  moduleProgress: ModuleProgress[]
  totalXpEarned: number
  totalTimeSpent: number
  completionPercentage: number
  createdAt: string
  updatedAt: string
}

export interface PathWithProgress extends CareerPath {
  userProgress?: UserProgress
  moduleCount: number
  completedModules: number
}

export interface ModuleWithProgress extends Module {
  isCompleted: boolean
  userProgress?: ModuleProgress
}