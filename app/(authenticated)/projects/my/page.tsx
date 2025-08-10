"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Users, MessageSquare } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const MY_PROJECTS = [
  {
    id: "ai-code-reviewer",
    title: "AI Code Reviewer",
    description: "An intelligent code review tool that provides automated feedback",
    status: "in-development" as const,
    techStack: ["React", "Node.js", "OpenAI"],
    image: "/placeholder.jpg",
    views: 1247,
    applications: 23,
    teamSize: 3,
    createdAt: "2024-01-15",
    lastActivity: "2 hours ago",
  },
  {
    id: "mobile-fitness",
    title: "Fitness Tracking App",
    description: "React Native app for tracking workouts and nutrition",
    status: "planning" as const,
    techStack: ["React Native", "Firebase"],
    image: "/placeholder.jpg",
    views: 456,
    applications: 8,
    teamSize: 2,
    createdAt: "2024-02-01",
    lastActivity: "1 day ago",
  },
]

const JOINED_PROJECTS = [
  {
    id: "blockchain-voting",
    title: "Decentralized Voting Platform",
    description: "Secure voting system built on blockchain technology",
    role: "Frontend Developer",
    owner: "Maya Patel",
    status: "mvp-ready" as const,
    techStack: ["Solidity", "React", "Web3.js"],
    image: "/placeholder.jpg",
    joinedAt: "2024-01-20",
    lastActivity: "3 hours ago",
  },
]

const APPLICATIONS = {
  sent: [
    {
      id: "dashboard-analytics",
      projectTitle: "Analytics Dashboard",
      position: "Frontend Developer",
      status: "pending" as const,
      appliedAt: "2024-02-10",
      owner: "Alex Rodriguez",
    },
    {
      id: "social-media-tool",
      projectTitle: "Social Media Management Tool",
      position: "UI/UX Designer",
      status: "rejected" as const,
      appliedAt: "2024-02-05",
      owner: "Jennifer Lee",
    },
  ],
  received: [
    {
      id: "app-1",
      applicantName: "David Kim",
      applicantLevel: "L3",
      position: "Backend Developer",
      projectTitle: "AI Code Reviewer",
      status: "pending" as const,
      appliedAt: "2024-02-12",
      message: "I have 3 years of experience with Node.js and AI APIs...",
    },
    {
      id: "app-2",
      applicantName: "Sarah Johnson",
      applicantLevel: "L2",
      position: "UI/UX Designer",
      projectTitle: "AI Code Reviewer",
      status: "pending" as const,
      appliedAt: "2024-02-11",
      message: "I'd love to help design intuitive interfaces for developer tools...",
    },
  ],
}

export default function MyProjectsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-50 text-blue-700"
      case "in-development":
        return "bg-emerald-50 text-emerald-700"
      case "mvp-ready":
        return "bg-purple-50 text-purple-700"
      case "pending":
        return "bg-yellow-50 text-yellow-700"
      case "rejected":
        return "bg-red-50 text-red-700"
      case "accepted":
        return "bg-green-50 text-green-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  return (
    <main className="min-h-[100svh] bg-muted/30">
      <div className="mx-auto w-full max-w-[110rem] px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">My Projects</h1>
          <p className="text-sm text-muted-foreground">Manage your projects, collaborations, and applications.</p>
        </header>

        <Tabs defaultValue="created" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="created">Created ({MY_PROJECTS.length})</TabsTrigger>
            <TabsTrigger value="joined">Joined ({JOINED_PROJECTS.length})</TabsTrigger>
            <TabsTrigger value="sent">Sent ({APPLICATIONS.sent.length})</TabsTrigger>
            <TabsTrigger value="received">Received ({APPLICATIONS.received.length})</TabsTrigger>
          </TabsList>

          {/* Created Projects */}
          <TabsContent value="created" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-0 p-4 ring-1 ring-emerald-200/50 bg-emerald-50/30">
                <div className="text-2xl font-bold text-emerald-700">{MY_PROJECTS.length}</div>
                <div className="text-sm text-emerald-600">Projects Created</div>
              </Card>
              <Card className="border-0 p-4 ring-1 ring-orange-200/50 bg-orange-50/30">
                <div className="text-2xl font-bold text-orange-700">
                  {MY_PROJECTS.reduce((sum, p) => sum + p.applications, 0)}
                </div>
                <div className="text-sm text-orange-600">Total Applications</div>
              </Card>
              <Card className="border-0 p-4 ring-1 ring-purple-200/50 bg-purple-50/30">
                <div className="text-2xl font-bold text-purple-700">
                  {MY_PROJECTS.reduce((sum, p) => sum + p.views, 0)}
                </div>
                <div className="text-sm text-purple-600">Total Views</div>
              </Card>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {MY_PROJECTS.map((project) => (
                <Card key={project.id} className="border-0 ring-1 ring-black/5 hover:shadow-lg/30 transition-all">
                  <div className="relative h-32 overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-200">
                    <Image
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className={`rounded-full px-2 text-[10px] font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace("-", " ")}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold line-clamp-1">{project.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{project.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{project.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{project.applications}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{project.teamSize}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">Updated {project.lastActivity}</div>
                      <Link href={`/projects/${project.id}`}>
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Joined Projects */}
          <TabsContent value="joined" className="space-y-6">
            <div className="grid gap-4">
              {JOINED_PROJECTS.map((project) => (
                <Card key={project.id} className="border-0 ring-1 ring-black/5">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{project.title}</h3>
                        <Badge
                          className={`rounded-full px-2 text-[10px] font-medium ${getStatusColor(project.status)}`}
                        >
                          {project.status.replace("-", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Role: {project.role}</span>
                        <span>Owner: {project.owner}</span>
                        <span>Joined: {project.joinedAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/projects/${project.id}`}>
                        <Button size="sm" variant="outline">
                          View Project
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sent Applications */}
          <TabsContent value="sent" className="space-y-6">
            <div className="grid gap-4">
              {APPLICATIONS.sent.map((app) => (
                <Card key={app.id} className="border-0 ring-1 ring-black/5">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{app.projectTitle}</h3>
                        <Badge className={`rounded-full px-2 text-[10px] font-medium ${getStatusColor(app.status)}`}>
                          {app.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">Applied for: {app.position}</div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span>Owner: {app.owner}</span>
                        <span>Applied: {app.appliedAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        View Application
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Received Applications */}
          <TabsContent value="received" className="space-y-6">
            <div className="grid gap-4">
              {APPLICATIONS.received.map((app) => (
                <Card key={app.id} className="border-0 ring-1 ring-black/5">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-1 ring-emerald-100">
                          <AvatarImage src="/placeholder-user.jpg" alt={app.applicantName} />
                          <AvatarFallback>{app.applicantName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">{app.applicantName}</div>
                            <Badge className="bg-emerald-50 text-emerald-700 text-xs">{app.applicantLevel}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Applied for {app.position} • {app.appliedAt}
                          </div>
                        </div>
                      </div>
                      <Badge className={`rounded-full px-2 text-[10px] font-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </Badge>
                    </div>
                    <div className="mb-4 p-3 rounded-lg bg-muted/50">
                      <div className="text-sm font-medium mb-1">Cover Message:</div>
                      <div className="text-sm text-muted-foreground">{app.message}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-600/90">
                        Accept
                      </Button>
                      <Button size="sm" variant="outline">
                        Decline
                      </Button>
                      <Button size="sm" variant="ghost">
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}