"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Users } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Density } from "./density-toggle"
import Image from "next/image"
import Link from "next/link"

export type Project = {
  id: string
  title: string
  description: string
  techStack: string[]
  projectType: "startup" | "open-source" | "learning" | "freelance"
  status: "planning" | "in-development" | "mvp-ready" | "looking-for-funding" | "completed"
  teamSize: number
  openPositions: string[]
  timeCommitment: "part-time" | "full-time" | "weekend" | "long-term"
  experienceLevel: "beginner" | "intermediate" | "advanced"
  views: number
  applications: number
  lastActivity: string
  image: string
  owner: {
    name: string
    avatar: string
    level: string
  }
}

type Props = { project: Project; density?: Density }

export default function ProjectCard({ project, density = "compact" }: Props) {
  const [applying, setApplying] = useState(false)

  const pad = density === "compact" ? "p-4" : "p-5"
  const padX = density === "compact" ? "px-4" : "px-5"
  const textBase = density === "compact" ? "text-[13px]" : "text-sm"
  const titleSize = density === "compact" ? "text-[15px]" : "text-base"

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "planning":
        return "bg-blue-50 text-blue-700"
      case "in-development":
        return "bg-emerald-50 text-emerald-700"
      case "mvp-ready":
        return "bg-purple-50 text-purple-700"
      case "looking-for-funding":
        return "bg-orange-50 text-orange-700"
      case "completed":
        return "bg-gray-50 text-gray-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  const getTypeColor = (type: Project["projectType"]) => {
    switch (type) {
      case "startup":
        return "bg-red-50 text-red-700"
      case "open-source":
        return "bg-green-50 text-green-700"
      case "learning":
        return "bg-blue-50 text-blue-700"
      case "freelance":
        return "bg-yellow-50 text-yellow-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border-0 ring-1 ring-black/5 transition-all hover:shadow-lg/30 motion-safe:hover:-translate-y-[2px]">
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-200">
        <Image
          src={project.image || "/placeholder.svg"}
          alt={project.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge className={`rounded-full px-2 text-[10px] font-medium ${getStatusColor(project.status)}`}>
            {project.status.replace("-", " ")}
          </Badge>
        </div>
      </div>

      <CardHeader className={`flex flex-row items-start gap-3 space-y-0 ${pad}`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`truncate ${titleSize} font-semibold leading-tight`}>{project.title}</h3>
            <Badge className={`rounded-full px-2 text-[10px] font-medium ${getTypeColor(project.projectType)}`}>
              {project.projectType}
            </Badge>
          </div>
          <p className={`line-clamp-2 ${textBase} text-muted-foreground leading-relaxed`}>{project.description}</p>
        </div>
      </CardHeader>

      <CardContent className={`flex-1 space-y-3 ${padX}`}>
        <div className="flex flex-wrap gap-1">
          {project.techStack.slice(0, 4).map((tech) => (
            <Badge key={tech} variant="secondary" className="rounded-full px-2 py-0 text-[10px]">
              {tech}
            </Badge>
          ))}
          {project.techStack.length > 4 && (
            <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px]">
              +{project.techStack.length - 4}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{project.teamSize} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{project.views}</span>
          </div>
        </div>

        {project.openPositions.length > 0 && (
          <div className="rounded-lg bg-emerald-50/50 p-2">
            <div className={`${textBase} font-medium text-emerald-800 mb-1`}>Open Positions</div>
            <div className="flex flex-wrap gap-1">
              {project.openPositions.slice(0, 2).map((position) => (
                <Badge key={position} className="bg-emerald-100 text-emerald-700 text-[10px] hover:bg-emerald-100">
                  {position}
                </Badge>
              ))}
              {project.openPositions.length > 2 && (
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px] hover:bg-emerald-100">
                  +{project.openPositions.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className={`flex items-center justify-between gap-3 ${pad}`}>
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 ring-1 ring-emerald-100">
            <AvatarImage src={project.owner.avatar || "/placeholder.svg"} alt={project.owner.name} />
            <AvatarFallback className="text-[10px]">{project.owner.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="text-xs text-muted-foreground">
            <div className="font-medium">{project.owner.name}</div>
            <div>{project.lastActivity}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/projects/${project.id}`}>
            <Button variant="outline" size="sm" className="rounded-lg bg-transparent text-xs">
              View
            </Button>
          </Link>
          <Button
            size="sm"
            className="rounded-lg bg-emerald-600 px-3 text-xs hover:bg-emerald-600/90"
            disabled={applying}
            onClick={async () => {
              setApplying(true)
              await new Promise((r) => setTimeout(r, 800))
              setApplying(false)
            }}
          >
            {applying ? "Applying..." : "Apply"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}