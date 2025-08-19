"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Github, ExternalLink, Heart, Eye, Share2, Settings, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface Project {
  _id: string
  title: string
  description: string
  author: {
    _id: string
    username: string
    displayName: string
    avatar?: string
    level: number
  }
  technologies: string[]
  githubUrl?: string
  liveUrl?: string
  images?: string[]
  openPositions?: Array<{
    title: string
    description: string
    requirements: string[]
  }>
  status: string
  likes: string[]
  views: number
  createdAt: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchProject()
  }, [params.id])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        setProject(data.data)
        // Check if user has liked this project
        // setIsLiked(data.data.likes.includes(currentUserId))
      } else {
        toast.error('Project not found')
        router.push('/projects')
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      toast.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!project) return
    
    try {
      const response = await fetch(`/api/projects/${project._id}/like`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsLiked(data.data.isLiked)
        setProject(prev => prev ? {
          ...prev,
          likes: data.data.project.likes
        } : null)
      }
    } catch (error) {
      console.error('Error liking project:', error)
      toast.error('Failed to like project')
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!project || updatingStatus) return
    
    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/projects/${project._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setProject(prev => prev ? { ...prev, status: newStatus } : null)
        toast.success('Project status updated')
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleDelete = async () => {
    if (!project || deleting) return
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/projects/${project._id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Project deleted successfully')
        router.push('/projects')
      } else {
        toast.error(data.error || 'Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    } finally {
      setDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'on-hold': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Project not found</h1>
        <Button onClick={() => router.push('/projects')}>Back to Projects</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 gap-2 px-0"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Button>

      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge className={getStatusColor(project.status)}>
                {project.status.replace('-', ' ')}
              </Badge>
              {user?.id === project.author?._id && (
                <div className="flex items-center gap-2">
                  <Select value={project.status} onValueChange={handleStatusUpdate} disabled={updatingStatus}>
                    <SelectTrigger className="w-40 h-8">
                      <Settings className="h-3 w-3 mr-1" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{project.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={deleting}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
            
            {/* Author Info */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={project.author?.avatar} />
                <AvatarFallback>
                  {(project.author?.displayName || project.author?.username || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{project.author?.displayName || project.author?.username || 'Unknown'}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    L{project.author?.level || 0}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant={isLiked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              className="gap-2"
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              {project.likes.length}
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              {project.views}
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              toast.success('Link copied to clipboard')
            }}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Description */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About This Project</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {project.description}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Images */}
          {project.images && project.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Project Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.images.map((imageUrl, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={`${project.title} - Image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Technologies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Open Positions */}
          {project.openPositions && project.openPositions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Open Positions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.openPositions.map((position, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{position.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{position.description}</p>
                    {position.requirements.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Required Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {position.requirements.map((req, reqIndex) => (
                            <Badge key={reqIndex} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.githubUrl && (
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                    View Source Code
                  </a>
                </Button>
              )}
              {project.liveUrl && (
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Live Demo
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Author Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={project.author?.avatar} />
                  <AvatarFallback>
                    {(project.author?.displayName || project.author?.username || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{project.author?.displayName || project.author?.username || 'Unknown'}</h4>
                  <p className="text-sm text-gray-500">@{project.author?.username || 'unknown'}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    Level {project.author?.level || 0}
                  </Badge>
                </div>
              </div>
              <Button className="w-full" asChild>
                <Link href={`/profile/${project.author?.username || 'unknown'}`}>
                  View Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}