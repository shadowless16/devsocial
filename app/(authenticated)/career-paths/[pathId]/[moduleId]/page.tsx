'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EnhancedModuleContent } from '@/components/career-paths/enhanced-module-content'

interface Props {
  params: Promise<{ pathId: string; moduleId: string }>
}

// Mock data - will be replaced with API call
const mockModule = {
  _id: 'html-basics',
  title: 'HTML Basics',
  description: 'Learn the fundamental building blocks of web pages with HTML',
  content: `# HTML Basics

HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page using markup.

## What is HTML?

HTML consists of a series of elements that tell the browser how to display content. Elements are represented by tags.

## Basic HTML Structure

Every HTML document has a basic structure:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Page Title</title>
</head>
<body>
    <h1>My First Heading</h1>
    <p>My first paragraph.</p>
</body>
</html>
\`\`\`

## Common HTML Elements

- **Headings**: \`<h1>\` to \`<h6>\`
- **Paragraphs**: \`<p>\`
- **Links**: \`<a href="url">Link text</a>\`
- **Images**: \`<img src="image.jpg" alt="Description">\`
- **Lists**: \`<ul>\`, \`<ol>\`, \`<li>\`

## Try It Yourself

Create a simple HTML page with a heading, paragraph, and link.`,
  estimatedMinutes: 120,
  xpReward: 50,
  order: 1,
  pathId: 'frontend-developer',
  canSkip: true,
  skillsLearned: ['HTML Structure', 'HTML Elements', 'Document Structure', 'Semantic HTML'],
  codeExamples: [
    {
      language: 'html',
      code: `<!DOCTYPE html>
<html>
<head>
    <title>My First Page</title>
</head>
<body>
    <h1>Welcome to HTML</h1>
    <p>This is my first HTML page!</p>
    <a href="https://developer.mozilla.org">Learn more about HTML</a>
</body>
</html>`,
      description: 'A basic HTML document structure',
      isInteractive: true,
      expectedOutput: 'A webpage with a heading, paragraph, and link'
    }
  ],
  externalResources: [
    {
      title: 'MDN HTML Basics',
      url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics',
      type: 'documentation' as const,
      description: 'Comprehensive guide to HTML basics from Mozilla Developer Network',
      difficulty: 'beginner' as const
    },
    {
      title: 'HTML Tutorial - W3Schools',
      url: 'https://www.w3schools.com/html/',
      type: 'tutorial' as const,
      description: 'Interactive HTML tutorial with examples',
      difficulty: 'beginner' as const
    },
    {
      title: 'HTML Crash Course',
      url: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
      type: 'video' as const,
      description: '1-hour HTML crash course for beginners',
      difficulty: 'beginner' as const
    }
  ],
  practiceExercises: [
    {
      title: 'Create Your First Webpage',
      description: 'Build a simple personal webpage using basic HTML elements',
      instructions: [
        'Create an HTML document with proper structure',
        'Add a heading with your name',
        'Write a paragraph about yourself',
        'Add a link to your favorite website',
        'Include an image (you can use a placeholder)'
      ],
      starterCode: `<!DOCTYPE html>
<html>
<head>
    <title>My First Page</title>
</head>
<body>
    <!-- Add your content here -->
</body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
<head>
    <title>My First Page</title>
</head>
<body>
    <h1>John Doe</h1>
    <p>I'm a web developer learning HTML!</p>
    <a href="https://github.com">Visit GitHub</a>
    <img src="https://via.placeholder.com/300x200" alt="Placeholder image">
</body>
</html>`,
      hints: [
        'Remember to use semantic HTML elements',
        'Don\'t forget the alt attribute for images',
        'Use proper indentation for readability'
      ],
      difficulty: 'easy' as const
    }
  ]
}

const mockPath = {
  title: 'Frontend Developer',
  modules: [
    { slug: 'html-basics', title: 'HTML Basics', order: 1 },
    { slug: 'css-fundamentals', title: 'CSS Fundamentals', order: 2 },
    { slug: 'javascript-essentials', title: 'JavaScript Essentials', order: 3 }
  ]
}

export default async function ModulePage({ params }: Props) {
  const { pathId, moduleId } = await params
  
  // Mock validation - replace with actual API calls
  if (pathId !== 'frontend-developer' || moduleId !== 'html-basics') {
    notFound()
  }

  const currentModuleIndex = mockPath.modules.findIndex(m => m.slug === moduleId)
  const prevModule = currentModuleIndex > 0 ? mockPath.modules[currentModuleIndex - 1] : null
  const nextModule = currentModuleIndex < mockPath.modules.length - 1 ? mockPath.modules[currentModuleIndex + 1] : null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href={`/career-paths/${pathId}`} 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {mockPath.title}
        </Link>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{mockModule.title}</h1>
            <p className="text-muted-foreground">{mockModule.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {Math.round(mockModule.estimatedMinutes / 60)}h {mockModule.estimatedMinutes % 60}m
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Trophy className="w-4 h-4" />
              {mockModule.xpReward} XP
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <EnhancedModuleContent
            module={mockModule}
            onComplete={() => console.log('Module completed')}
            onSkip={() => console.log('Module skipped')}
            isCompleted={false}
          />

          <div className="flex justify-between mt-8">
            {prevModule ? (
              <Link href={`/career-paths/${pathId}/${prevModule.slug}`}>
                <Button variant="outline" className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  {prevModule.title}
                </Button>
              </Link>
            ) : (
              <div />
            )}
            
            {nextModule ? (
              <Link href={`/career-paths/${pathId}/${nextModule.slug}`}>
                <Button className="flex items-center gap-2">
                  {nextModule.title}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link href={`/career-paths/${pathId}`}>
                <Button className="flex items-center gap-2">
                  Complete Path
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            {/* Module Progress */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Module Progress</h3>
              <div className="space-y-3">
                {mockPath.modules.map((module, index) => (
                  <div key={module.slug} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      module.slug === moduleId 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        module.slug === moduleId ? 'text-primary' : 'text-foreground'
                      }`}>
                        {module.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}