import { Suspense } from 'react'
import Link from 'next/link'
import { BookOpen, Clock, Trophy, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Temporary mock data - will be replaced with API call
const mockPaths = [
  {
    _id: '1',
    title: 'Frontend Developer',
    slug: 'frontend-developer',
    description: 'Master modern frontend development with HTML, CSS, JavaScript, and React',
    difficulty: 'Beginner' as const,
    estimatedHours: 40,
    icon: '🎨',
    color: 'bg-blue-500',
    moduleCount: 5,
    completedModules: 0,
    tags: ['HTML', 'CSS', 'JavaScript', 'React']
  }
]

function PathCard({ path }: { path: typeof mockPaths[0] }) {
  const progressPercentage = (path.completedModules / path.moduleCount) * 100

  return (
    <Link href={`/career-paths/${path.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg ${path.color} flex items-center justify-center text-2xl`}>
              {path.icon}
            </div>
            <div>
              <CardTitle className="text-xl">{path.title}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {path.difficulty}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          {path.description}
        </CardDescription>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {path.moduleCount} modules
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {path.estimatedHours}h
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {path.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {path.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{path.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
    </Link>
  )
}

export default function CareerPathsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Career Paths</h1>
        <p className="text-muted-foreground">
          Structured learning paths to advance your development career
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {mockPaths.map((path) => (
          <PathCard key={path._id} path={path} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="font-semibold">Earn XP & Badges</p>
                <p className="text-sm text-muted-foreground">Complete modules to level up</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <div>
                <p className="font-semibold">Interactive Learning</p>
                <p className="text-sm text-muted-foreground">Hands-on coding examples</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-500" />
              <div>
                <p className="font-semibold">Community Support</p>
                <p className="text-sm text-muted-foreground">Learn with other developers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}