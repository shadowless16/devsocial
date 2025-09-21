'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import React, { useState } from 'react'
import { ArrowLeft, BookOpen, Clock, Play, CheckCircle, Brain } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SkillAssessment } from '@/components/career-paths/skill-assessment'

interface Props {
  params: Promise<{ pathId: string }>
}

// Mock data - will be replaced with API call
const mockPath = {
  _id: 'frontend-developer',
  title: 'Frontend Developer',
  description: 'Master modern frontend development with HTML, CSS, JavaScript, and React. Build responsive websites and interactive web applications.',
  difficulty: 'Beginner' as const,
  estimatedHours: 40,
  icon: '🎨',
  color: 'bg-blue-500',
  tags: ['HTML', 'CSS', 'JavaScript', 'React'],
  modules: [
    { _id: '1', title: 'HTML Basics', slug: 'html-basics', description: 'Learn the fundamentals of HTML', estimatedMinutes: 120, isCompleted: false, order: 1 },
    { _id: '2', title: 'CSS Fundamentals', slug: 'css-fundamentals', description: 'Style your web pages with CSS', estimatedMinutes: 180, isCompleted: false, order: 2 },
    { _id: '3', title: 'JavaScript Essentials', slug: 'javascript-essentials', description: 'Add interactivity with JavaScript', estimatedMinutes: 240, isCompleted: false, order: 3 },
    { _id: '4', title: 'React Introduction', slug: 'react-introduction', description: 'Build dynamic UIs with React', estimatedMinutes: 300, isCompleted: false, order: 4 },
    { _id: '5', title: 'Project Building', slug: 'project-building', description: 'Create your first full project', estimatedMinutes: 180, isCompleted: false, order: 5 }
  ]
}

function ModuleCard({ module, pathId }: { module: typeof mockPath.modules[0], pathId: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              {module.isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-semibold">{module.title}</h3>
              <p className="text-sm text-muted-foreground">{module.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {Math.round(module.estimatedMinutes / 60)}h {module.estimatedMinutes % 60}m
                </span>
              </div>
            </div>
          </div>
          <Link href={`/career-paths/${pathId}/${module.slug}`}>
            <Button variant={module.isCompleted ? "secondary" : "default"} size="sm">
              {module.isCompleted ? "Review" : "Start"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PathPage({ params }: Props) {
  const [showAssessment, setShowAssessment] = useState(false)
  const [assessmentCompleted, setAssessmentCompleted] = useState(false)
  const [pathId, setPathId] = useState<string>('')
  
  // Get pathId from params
  React.useEffect(() => {
    params.then(({ pathId }) => {
      setPathId(pathId)
      // Mock check - replace with actual API call
      if (pathId !== 'frontend-developer') {
        notFound()
      }
    })
  }, [params])

  const completedModules = mockPath.modules.filter(m => m.isCompleted).length
  const progressPercentage = (completedModules / mockPath.modules.length) * 100
  
  const mockAssessmentQuestions = [
    {
      question: 'What does HTML stand for?',
      options: [
        'Hyper Text Markup Language',
        'High Tech Modern Language',
        'Home Tool Markup Language',
        'Hyperlink and Text Markup Language'
      ],
      correctAnswer: 0,
      skillArea: 'HTML',
      weight: 1
    },
    {
      question: 'Which CSS property is used to change the text color?',
      options: ['font-color', 'text-color', 'color', 'foreground-color'],
      correctAnswer: 2,
      skillArea: 'CSS',
      weight: 1
    },
    {
      question: 'How do you declare a variable in JavaScript?',
      options: ['var myVar;', 'variable myVar;', 'v myVar;', 'declare myVar;'],
      correctAnswer: 0,
      skillArea: 'JavaScript',
      weight: 1
    }
  ]
  
  const handleAssessmentComplete = (result: any) => {
    console.log('Assessment result:', result)
    setAssessmentCompleted(true)
    setShowAssessment(false)
    // Here you would typically save the result and redirect to recommended module
  }
  
  if (showAssessment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SkillAssessment
          pathTitle={mockPath.title}
          questions={mockAssessmentQuestions}
          onComplete={handleAssessmentComplete}
          onSkip={() => setShowAssessment(false)}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/career-paths" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Career Paths
        </Link>
        
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-xl ${mockPath.color} flex items-center justify-center text-3xl`}>
            {mockPath.icon}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{mockPath.title}</h1>
            <p className="text-muted-foreground mb-4">{mockPath.description}</p>
            
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary">{mockPath.difficulty}</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                {mockPath.modules.length} modules
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {mockPath.estimatedHours}h total
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Your Progress</span>
                <span>{completedModules}/{mockPath.modules.length} modules completed</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {mockPath.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              {!assessmentCompleted && (
                <Button 
                  onClick={() => setShowAssessment(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  Take Skill Assessment
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {assessmentCompleted && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800 dark:text-green-200">Assessment Complete!</h3>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your personalized learning path has been created based on your assessment results.
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Learning Modules</h2>
          {mockPath.modules.map((module) => (
            <ModuleCard key={module._id} module={module} pathId={pathId} />
          ))}
        </div>
      </div>
    </div>
  )
}