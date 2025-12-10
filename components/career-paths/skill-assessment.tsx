'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle, Brain, ArrowRight, RotateCcw } from 'lucide-react'

interface SkillQuestion {
  question: string
  options: string[]
  correctAnswer: number
  skillArea: string
  weight: number
}

interface AssessmentResult {
  score: number
  skillAreas: { [key: string]: number }
  recommendedStartModule: string
  skipModules: string[]
  level: 'beginner' | 'intermediate' | 'advanced'
}

interface Props {
  pathTitle: string
  questions: SkillQuestion[]
  onComplete: (result: AssessmentResult) => void
  onSkip: () => void
}

export function SkillAssessment({ pathTitle, questions, onComplete, onSkip }: Props) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<AssessmentResult | null>(null)

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      calculateResults()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const calculateResults = () => {
    let totalScore = 0
    let maxScore = 0
    const skillScores: { [key: string]: { correct: number, total: number } } = {}

    questions.forEach((question, index) => {
      const userAnswer = answers[index]
      const isCorrect = userAnswer === question.correctAnswer
      const points = isCorrect ? question.weight : 0
      
      totalScore += points
      maxScore += question.weight

      if (!skillScores[question.skillArea]) {
        skillScores[question.skillArea] = { correct: 0, total: 0 }
      }
      
      skillScores[question.skillArea].correct += points
      skillScores[question.skillArea].total += question.weight
    })

    const percentage = (totalScore / maxScore) * 100
    const skillAreas: { [key: string]: number } = {}
    
    Object.entries(skillScores).forEach(([skill, scores]) => {
      skillAreas[skill] = (scores.correct / scores.total) * 100
    })

    // Determine level and recommendations
    let level: 'beginner' | 'intermediate' | 'advanced'
    let recommendedStartModule: string
    let skipModules: string[] = []

    if (percentage >= 80) {
      level = 'advanced'
      recommendedStartModule = 'advanced-concepts'
      skipModules = ['html-basics', 'css-fundamentals']
    } else if (percentage >= 60) {
      level = 'intermediate'
      recommendedStartModule = 'javascript-essentials'
      skipModules = ['html-basics']
    } else {
      level = 'beginner'
      recommendedStartModule = 'html-basics'
    }

    const result: AssessmentResult = {
      score: percentage,
      skillAreas,
      recommendedStartModule,
      skipModules,
      level
    }

    setResults(result)
    setShowResults(true)
  }

  const resetAssessment = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
    setResults(null)
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (showResults && results) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
          <p className="text-muted-foreground">
            Here&apos;s your personalized learning recommendation for {pathTitle}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {Math.round(results.score)}%
            </div>
            <Badge className={`text-lg px-4 py-2 ${
              results.level === 'advanced' ? 'bg-purple-100 text-purple-800' :
              results.level === 'intermediate' ? 'bg-orange-100 text-orange-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {results.level.charAt(0).toUpperCase() + results.level.slice(1)} Level
            </Badge>
          </div>

          {/* Skill Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Skill Areas</h3>
            <div className="grid gap-4">
              {Object.entries(results.skillAreas).map(([skill, score]) => (
                <div key={skill} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{skill}</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(score)}%
                    </span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">📚 Your Learning Path</h3>
            <div className="space-y-3">
              <p>
                <strong>Recommended starting point:</strong> {results.recommendedStartModule}
              </p>
              {results.skipModules.length > 0 && (
                <p>
                  <strong>You can skip:</strong> {results.skipModules.join(', ')}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Based on your assessment, we&apos;ve customized your learning path to focus on areas where you can grow the most.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={() => onComplete(results)} size="lg">
              Start Learning Path
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={resetAssessment}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentQ = questions[currentQuestion]
  const hasAnswer = answers[currentQuestion] !== undefined

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <CardTitle>Skill Assessment - {pathTitle}</CardTitle>
          </div>
          <Button variant="ghost" onClick={onSkip}>
            Skip Assessment
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">{currentQ.question}</h3>
          
          <RadioGroup
            value={answers[currentQuestion]?.toString()}
            onValueChange={(value) => handleAnswerSelect(currentQuestion, parseInt(value))}
          >
            {currentQ.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!hasAnswer}
          >
            {currentQuestion === questions.length - 1 ? 'Finish Assessment' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}