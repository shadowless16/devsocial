"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Eye, Github, Globe, Heart, MessageCircle, Play, Share2, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// Mock data - in real app this would come from API
const PROJECT_DATA = {
  id: "ai-code-reviewer",
  title: "AI Code Reviewer",
  description: `An intelligent code review tool that provides automated feedback and suggestions for better code quality. 

This project aims to revolutionize the way developers approach code reviews by leveraging advanced AI models to provide instant, contextual feedback. The tool integrates seamlessly with popular version control systems and provides detailed suggestions for improvements, potential bugs, and best practices.

Key features include:
- Real-time code analysis and suggestions
- Integration with GitHub, GitLab, and Bitbucket
- Customizable review rules and standards
- Team collaboration features
- Performance metrics and insights`,
  techStack: ["React", "Node.js", "OpenAI", "TypeScript", "PostgreSQL", "Docker"],
  projectType: "startup" as const,
  status: "in-development" as const,
  timeCommitment: "part-time" as const,
  experienceLevel: "intermediate" as const,
  views: 1247,
  applications: 23,
  likes: 89,
  createdAt: "2024-01-15",
  lastActivity: "2 hours ago",
  images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
  demoUrl: "https://demo.ai-code-reviewer.com",
  githubUrl: "https://github.com/team/ai-code-reviewer",
  owner: {
    id: "sarah-chen",
    name: "Sarah Chen",
    avatar: "/placeholder-user.jpg",
    level: "L4",
    role: "Project Lead",
  },
  team: [
    {
      id: "sarah-chen",
      name: "Sarah Chen",
      avatar: "/placeholder-user.jpg",
      level: "L4",
      role: "Project Lead",
      joinedAt: "2024-01-15",
    },
    {
      id: "mike-johnson",
      name: "Mike Johnson",
      avatar: "/placeholder-user.jpg",
      level: "L3",
      role: "Backend Developer",
      joinedAt: "2024-01-20",
    },
    {
      id: "lisa-wang",
      name: "Lisa Wang",
      avatar: "/placeholder-user.jpg",
      level: "L2",
      role: "Frontend Developer",
      joinedAt: "2024-02-01",
    },
  ],
  openPositions: [
    {
      title: "Backend Developer",
      description: "Experience with Node.js and AI/ML APIs required",
      requirements: ["Node.js", "Express", "PostgreSQL", "OpenAI API"],
      timeCommitment: "15-20 hours/week",
    },
    {
      title: "UI/UX Designer",
      description: "Design intuitive interfaces for developer tools",
      requirements: ["Figma", "User Research", "Prototyping"],
      timeCommitment: "10-15 hours/week",
    },
  ],
  updates: [
    {
      id: "1",
      author: "Sarah Chen",
      avatar: "/placeholder-user.jpg",
      content:
        "Just integrated the new OpenAI GPT-4 model for better code analysis! The accuracy has improved significantly.",
      timestamp: "2 hours ago",
      likes: 12,
    },
    {
      id: "2",
      author: "Mike Johnson",
      avatar: "/placeholder-user.jpg",
      content: "Database optimization complete. Query performance improved by 40%!",
      timestamp: "1 day ago",
      likes: 8,
    },
  ],
}

const RELATED_PROJECTS = [
  {
    id: "code-mentor",
    title: "Code Mentor AI",
    description: "AI-powered coding assistant for beginners",
    image: "/placeholder.jpg",
    techStack: ["Python", "React", "OpenAI"],
    teamSize: 4,
  },
  {
    id: "dev-analytics",
    title: "Developer Analytics Dashboard",
    description: "Track coding productivity and habits",
    image: "/placeholder.jpg",
    techStack: ["Vue.js", "Node.js", "MongoDB"],
    teamSize: 3,
  },
]

export default function ProjectDetailPage() {
  const [comment, setComment] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [applying, setApplying] = useState(false)

  return (
    <main className="min-h-[100svh] bg-muted/30">
      <div className="mx-auto w-full max-w-[110rem] px-4 py-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects" className="hover:text-foreground">
            Projects
          </Link>
          <span>/</span>
          <span className="text-foreground">{PROJECT_DATA.title}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Project Header */}
            <Card className="border-0 ring-1 ring-black/5">
              <CardHeader className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{PROJECT_DATA.title}</h1>
                      <Badge className={`rounded-full px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700`}>
                        {PROJECT_DATA.status.replace("-", " ")}
                      </Badge>
                      <Badge className={`rounded-full px-3 py-1 text-xs font-medium bg-red-50 text-red-700`}>
                        {PROJECT_DATA.projectType}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {PROJECT_DATA.techStack.map((tech) => (
                        <Badge key={tech} variant="secondary" className="rounded-full">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{PROJECT_DATA.views} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{PROJECT_DATA.team.length} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created {PROJECT_DATA.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-2 ${isLiked ? "text-red-600" : ""}`}
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                      {PROJECT_DATA.likes + (isLiked ? 1 : 0)}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Media Section */}
            <Card className="border-0 ring-1 ring-black/5">
              <CardHeader className="pb-4">
                <h2 className="text-lg font-semibold">Media & Links</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  {PROJECT_DATA.images.map((image, idx) => (
                    <div key={idx} className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${PROJECT_DATA.title} screenshot ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="gap-2 bg-transparent" asChild>
                    <a href={PROJECT_DATA.demoUrl} target="_blank" rel="noopener noreferrer">
                      <Play className="h-4 w-4" />
                      Live Demo
                    </a>
                  </Button>
                  <Button variant="outline" className="gap-2 bg-transparent" asChild>
                    <a href={PROJECT_DATA.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Globe className="h-4 w-4" />
                    Website
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="border-0 ring-1 ring-black/5">
              <CardHeader className="pb-4">
                <h2 className="text-lg font-semibold">About This Project</h2>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {PROJECT_DATA.description.split("\n\n").map((paragraph, idx) => (
                    <p key={idx} className="mb-4 leading-relaxed text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Section */}
            <Card className="border-0 ring-1 ring-black/5">
              <CardHeader className="pb-4">
                <h2 className="text-lg font-semibold">Team Members</h2>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {PROJECT_DATA.team.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Avatar className="h-10 w-10 ring-1 ring-emerald-100">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{member.name}</div>
                          <Badge className="bg-emerald-50 text-emerald-700 text-xs">{member.level}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{member.role}</div>
                        <div className="text-xs text-muted-foreground">Joined {member.joinedAt}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Updates */}
            <Card className="border-0 ring-1 ring-black/5">
              <CardHeader className="pb-4">
                <h2 className="text-lg font-semibold">Recent Updates</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {PROJECT_DATA.updates.map((update) => (
                  <div key={update.id} className="flex gap-3 p-4 rounded-lg bg-muted/30">
                    <Avatar className="h-8 w-8 ring-1 ring-emerald-100">
                      <AvatarImage src={update.avatar || "/placeholder.svg"} alt={update.author} />
                      <AvatarFallback>{update.author.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-sm">{update.author}</div>
                        <div className="text-xs text-muted-foreground">{update.timestamp}</div>
                      </div>
                      <p className="text-sm leading-relaxed">{update.content}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs">
                          <Heart className="h-3 w-3" />
                          {update.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs">
                          <MessageCircle className="h-3 w-3" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="border-0 ring-1 ring-black/5">
              <CardHeader className="pb-4">
                <h2 className="text-lg font-semibold">Discussion</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 ring-1 ring-emerald-100">
                    <AvatarImage src="/placeholder-user.jpg" alt="You" />
                    <AvatarFallback>YO</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Share your thoughts about this project..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-600/90">
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="text-sm text-muted-foreground text-center py-4">
                  No comments yet. Be the first to share your thoughts!
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Open Positions */}
            <Card className="border-0 ring-1 ring-black/5">
              <CardHeader className="pb-4">
                <h3 className="font-semibold">Open Positions</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {PROJECT_DATA.openPositions.map((position, idx) => (
                  <div key={idx} className="space-y-3 p-4 rounded-lg bg-emerald-50/50">
                    <div>
                      <div className="font-medium text-emerald-800">{position.title}</div>
                      <div className="text-sm text-emerald-700 mt-1">{position.description}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-emerald-800">Requirements:</div>
                      <div className="flex flex-wrap gap-1">
                        {position.requirements.map((req) => (
                          <Badge key={req} className="bg-emerald-100 text-emerald-700 text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-emerald-700">Time: {position.timeCommitment}</div>
                  </div>
                ))}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-600/90">Apply to Join</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply to Join Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="position">Position</Label>
                        <select className="w-full mt-1 p-2 border rounded-lg">
                          {PROJECT_DATA.openPositions.map((pos, idx) => (
                            <option key={idx} value={pos.title}>
                              {pos.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="message">Cover Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell the team why you'd be a great fit..."
                          className="mt-1"
                        />
                      </div>
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-600/90"
                        disabled={applying}
                        onClick={async () => {
                          setApplying(true)
                          await new Promise((r) => setTimeout(r, 1000))
                          setApplying(false)
                        }}
                      >
                        {applying ? "Sending Application..." : "Send Application"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Project Owner */}
            <Card className="border-0 ring-1 ring-black/5">
              <CardHeader className="pb-4">
                <h3 className="font-semibold">Project Owner</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-1 ring-emerald-100">
                    <AvatarImage src={PROJECT_DATA.owner.avatar || "/placeholder.svg"} alt={PROJECT_DATA.owner.name} />
                    <AvatarFallback>{PROJECT_DATA.owner.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{PROJECT_DATA.owner.name}</div>
                      <Badge className="bg-emerald-50 text-emerald-700 text-xs">{PROJECT_DATA.owner.level}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{PROJECT_DATA.owner.role}</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  Message Owner
                </Button>
              </CardContent>
            </Card>

            {/* Related Projects */}
            <Card className="border-0 ring-1 ring-black/5">
              <CardHeader className="pb-4">
                <h3 className="font-semibold">Related Projects</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {RELATED_PROJECTS.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={project.image || "/placeholder.svg"}
                          alt={project.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm line-clamp-1">{project.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{project.description}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {project.teamSize}
                          </div>
                          <div className="flex gap-1">
                            {project.techStack.slice(0, 2).map((tech) => (
                              <Badge key={tech} variant="secondary" className="text-[10px] px-1">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}