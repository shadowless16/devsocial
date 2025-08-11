"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Github, ExternalLink, Heart, Eye, Filter } from 'lucide-react'
import Link from 'next/link'

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
  images: string[]
  status: string
  likes: string[]
  views: number
  createdAt: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    status: '',
    tech: '',
    search: ''
  })

  useEffect(() => {
    fetchProjects()
  }, [filter])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      if (filter.tech) params.append('tech', filter.tech)
      
      const response = await fetch(`/api/projects?${params}`)
      const data = await response.json()
      
      if (data.success) {
        let filteredProjects = data.data.projects
        
        if (filter.search) {
          filteredProjects = filteredProjects.filter((project: Project) =>
            project.title.toLowerCase().includes(filter.search.toLowerCase()) ||
            project.description.toLowerCase().includes(filter.search.toLowerCase())
          )
        }
        
        setProjects(filteredProjects)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-600 mt-2">Discover amazing projects from the community</p>
        </div>
        <Button asChild>
          <Link href="/projects/create">
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Input
          placeholder="Search projects..."
          value={filter.search}
          onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
          className="max-w-xs"
        />
        
        <Select value={filter.status || 'all'} onValueChange={(value) => setFilter(prev => ({ ...prev, status: value === 'all' ? '' : value }))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Technology..."
          value={filter.tech}
          onChange={(e) => setFilter(prev => ({ ...prev, tech: e.target.value }))}
          className="max-w-xs"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-3">
                <CardTitle className="text-lg line-clamp-1 flex-1">{project.title}</CardTitle>
                <Badge className={`${getStatusColor(project.status)} text-xs px-2 py-1`}>
                  {project.status.replace('-', ' ')}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={project.author.avatar} />
                  <AvatarFallback className="text-xs">
                    {project.author.displayName?.[0] || project.author.username[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600 dark:text-gray-400">{project.author.displayName || project.author.username}</span>
                <Badge variant="outline" className="text-xs">L{project.author.level}</Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>
              
              {/* Technologies */}
              <div className="flex flex-wrap gap-1 mb-4">
                {project.technologies.slice(0, 3).map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {project.technologies.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{project.technologies.length - 3}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{project.likes.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{project.views}</span>
                  </div>
                  {project.githubUrl && (
                    <Button variant="ghost" size="sm" className="p-1 h-6 w-6" asChild>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  {project.liveUrl && (
                    <Button variant="ghost" size="sm" className="p-1 h-6 w-6" asChild>
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
                
                <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-700" asChild>
                  <Link href={`/projects/${project._id}`}>
                    View
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters or be the first to add a project!</p>
          <Button asChild>
            <Link href="/projects/create">
              <Plus className="w-4 h-4 mr-2" />
              Add First Project
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}