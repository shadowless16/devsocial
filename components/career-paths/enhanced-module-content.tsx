'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Code, 
  ExternalLink, 
  Play, 
  CheckCircle, 
  Copy,
  Eye,
  Lightbulb,
  Target,
  Clock,
  Trophy
} from 'lucide-react'

interface CodeExample {
  language: string
  code: string
  description?: string
  isInteractive?: boolean
  expectedOutput?: string
}

interface ExternalResource {
  title: string
  url: string
  type: 'documentation' | 'tutorial' | 'video' | 'tool' | 'reference'
  description?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

interface PracticeExercise {
  title: string
  description: string
  instructions: string[]
  starterCode?: string
  solution?: string
  hints?: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

interface ModuleData {
  title: string
  description: string
  content: string
  codeExamples: CodeExample[]
  externalResources: ExternalResource[]
  practiceExercises: PracticeExercise[]
  skillsLearned: string[]
  estimatedMinutes: number
  xpReward: number
  canSkip: boolean
}

interface Props {
  module: ModuleData
  onComplete: () => void
  onSkip: () => void
  isCompleted: boolean
}

export function EnhancedModuleContent({ module, onComplete, onSkip, isCompleted }: Props) {
  const [activeTab, setActiveTab] = useState('content')
  const [showSolution, setShowSolution] = useState<{ [key: number]: boolean }>({})
  const [showHints, setShowHints] = useState<{ [key: number]: boolean }>({})

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      case 'beginner': return 'bg-blue-100 text-blue-800'
      case 'intermediate': return 'bg-orange-100 text-orange-800'
      case 'advanced': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'documentation': return <BookOpen className="w-4 h-4" />
      case 'tutorial': return <Play className="w-4 h-4" />
      case 'video': return <Play className="w-4 h-4" />
      case 'tool': return <Code className="w-4 h-4" />
      case 'reference': return <ExternalLink className="w-4 h-4" />
      default: return <ExternalLink className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
            <p className="text-muted-foreground text-lg">{module.description}</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.round(module.estimatedMinutes / 60)}h {module.estimatedMinutes % 60}m
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              {module.xpReward} XP
            </div>
          </div>
        </div>

        {/* Skills & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium">You&apos;ll learn:</span>
            {module.skillsLearned.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            {module.canSkip && !isCompleted && (
              <Button variant="outline" onClick={onSkip}>
                Skip if you know this
              </Button>
            )}
            {!isCompleted && (
              <Button onClick={onComplete} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Learn
          </TabsTrigger>
          <TabsTrigger value="practice" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Practice
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="examples" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Examples
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      const isInline = !match;
                      return !isInline && match ? (
                        <div className="relative">
                          <SyntaxHighlighter
                            language={match[1]}
                            PreTag="div"
                            className="rounded-lg"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(String(children))}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {module.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Practice Tab */}
        <TabsContent value="practice" className="space-y-6">
          {module.practiceExercises.map((exercise, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {exercise.title}
                  </CardTitle>
                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                    {exercise.difficulty}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{exercise.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    {exercise.instructions.map((instruction, i) => (
                      <li key={i} className="text-sm">{instruction}</li>
                    ))}
                  </ol>
                </div>

                {exercise.starterCode && (
                  <div>
                    <h4 className="font-semibold mb-2">Starter Code:</h4>
                    <div className="relative">
                      <SyntaxHighlighter
                        style={oneDark}
                        language="html"
                        PreTag="div"
                        className="rounded-lg"
                      >
                        {exercise.starterCode}
                      </SyntaxHighlighter>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(exercise.starterCode!)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {exercise.hints && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHints(prev => ({ ...prev, [index]: !prev[index] }))}
                    >
                      <Lightbulb className="w-4 h-4 mr-1" />
                      {showHints[index] ? 'Hide' : 'Show'} Hints
                    </Button>
                  )}
                  {exercise.solution && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSolution(prev => ({ ...prev, [index]: !prev[index] }))}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {showSolution[index] ? 'Hide' : 'Show'} Solution
                    </Button>
                  )}
                </div>

                {showHints[index] && exercise.hints && (
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2">💡 Hints:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {exercise.hints.map((hint, i) => (
                        <li key={i} className="text-sm">{hint}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {showSolution[index] && exercise.solution && (
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2">✅ Solution:</h5>
                    <SyntaxHighlighter
                      style={oneDark}
                      language="html"
                      PreTag="div"
                      className="rounded-lg"
                    >
                      {exercise.solution}
                    </SyntaxHighlighter>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4">
            {module.externalResources.map((resource, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getResourceIcon(resource.type)}
                      <div>
                        <h3 className="font-semibold">{resource.title}</h3>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {resource.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {resource.type}
                          </Badge>
                          {resource.difficulty && (
                            <Badge className={`text-xs ${getDifficultyColor(resource.difficulty)}`}>
                              {resource.difficulty}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          {module.codeExamples.map((example, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Code Example {index + 1}</CardTitle>
                {example.description && (
                  <p className="text-muted-foreground">{example.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <SyntaxHighlighter
                    style={oneDark}
                    language={example.language}
                    PreTag="div"
                    className="rounded-lg"
                  >
                    {example.code}
                  </SyntaxHighlighter>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(example.code)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                {example.expectedOutput && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <h5 className="font-semibold mb-2">Expected Output:</h5>
                    <pre className="text-sm">{example.expectedOutput}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}