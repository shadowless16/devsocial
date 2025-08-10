"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import ProjectsFilters, { type ProjectFiltersState } from "@/components/projects/projects-filters"
import ProjectCard, { type Project } from "@/components/projects/project-card"
import DensityToggle, { type Density } from "@/components/projects/density-toggle"

const ALL_PROJECTS: Project[] = [
  {
    id: "ai-code-reviewer",
    title: "AI Code Reviewer",
    description:
      "An intelligent code review tool that provides automated feedback and suggestions for better code quality.",
    techStack: ["React", "Node.js", "OpenAI", "TypeScript"],
    projectType: "startup",
    status: "in-development",
    teamSize: 3,
    openPositions: ["Backend Developer", "UI/UX Designer"],
    timeCommitment: "part-time",
    experienceLevel: "intermediate",
    views: 234,
    applications: 12,
    lastActivity: "2 hours ago",
    image: "/placeholder.jpg",
    owner: {
      name: "Sarah Chen",
      avatar: "/placeholder-user.jpg",
      level: "L4",
    },
  },
  {
    id: "open-source-dashboard",
    title: "Open Source Analytics Dashboard",
    description:
      "A beautiful, customizable dashboard for tracking open source project metrics and community engagement.",
    techStack: ["Vue.js", "Python", "PostgreSQL", "Docker"],
    projectType: "open-source",
    status: "mvp-ready",
    teamSize: 5,
    openPositions: ["DevOps Engineer"],
    timeCommitment: "weekend",
    experienceLevel: "advanced",
    views: 456,
    applications: 8,
    lastActivity: "1 day ago",
    image: "/placeholder.jpg",
    owner: {
      name: "Alex Rodriguez",
      avatar: "/placeholder-user.jpg",
      level: "L5",
    },
  },
  {
    id: "mobile-fitness-app",
    title: "Fitness Tracking Mobile App",
    description: "A React Native app for tracking workouts, nutrition, and connecting with fitness communities.",
    techStack: ["React Native", "Firebase", "Node.js"],
    projectType: "learning",
    status: "planning",
    teamSize: 2,
    openPositions: ["Mobile Developer", "UI/UX Designer", "Backend Developer"],
    timeCommitment: "full-time",
    experienceLevel: "beginner",
    views: 189,
    applications: 15,
    lastActivity: "3 hours ago",
    image: "/placeholder.jpg",
    owner: {
      name: "Jordan Kim",
      avatar: "/placeholder-user.jpg",
      level: "L2",
    },
  },
  {
    id: "blockchain-voting",
    title: "Decentralized Voting Platform",
    description:
      "A secure, transparent voting system built on blockchain technology for organizations and communities.",
    techStack: ["Solidity", "React", "Web3.js", "IPFS"],
    projectType: "startup",
    status: "looking-for-funding",
    teamSize: 4,
    openPositions: ["Blockchain Developer", "Security Auditor"],
    timeCommitment: "full-time",
    experienceLevel: "advanced",
    views: 567,
    applications: 6,
    lastActivity: "5 hours ago",
    image: "/placeholder.jpg",
    owner: {
      name: "Maya Patel",
      avatar: "/placeholder-user.jpg",
      level: "L6",
    },
  },
]

export default function ProjectsPage() {
  const [filters, setFilters] = useState<ProjectFiltersState>({
    techStack: "all",
    projectType: "all",
    status: "all",
    timeCommitment: "all",
    experienceLevel: "all",
  })
  const [density, setDensity] = useState<Density>("compact")

  const projects = useMemo(() => {
    return ALL_PROJECTS.filter((p) => {
      const techOk =
        filters.techStack === "all" ||
        p.techStack.some((tech) => tech.toLowerCase().includes(filters.techStack.toLowerCase()))
      const typeOk = filters.projectType === "all" || p.projectType === filters.projectType
      const statusOk = filters.status === "all" || p.status === filters.status
      const commitmentOk = filters.timeCommitment === "all" || p.timeCommitment === filters.timeCommitment
      const experienceOk = filters.experienceLevel === "all" || p.experienceLevel === filters.experienceLevel

      return techOk && typeOk && statusOk && commitmentOk && experienceOk
    })
  }, [filters])

  return (
    <main className="min-h-[100svh] bg-muted/30">
      <div className="mx-auto w-full max-w-[110rem] px-4 py-6">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Projects</h1>
            <p className="text-sm text-muted-foreground">
              Discover projects, find collaborators, and build amazing things together.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DensityToggle value={density} onChange={setDensity} />
            <Link href="/projects/create">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-600/90">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </Link>
          </div>
        </header>

        <div className="sticky top-0 z-10 mb-5 bg-muted/30 pb-3 pt-2">
          <ProjectsFilters value={filters} onChange={setFilters} />
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-0 p-4 ring-1 ring-emerald-200/50 bg-emerald-50/30">
            <div className="text-2xl font-bold text-emerald-700">{ALL_PROJECTS.length}</div>
            <div className="text-sm text-emerald-600">Active Projects</div>
          </Card>
          <Card className="border-0 p-4 ring-1 ring-orange-200/50 bg-orange-50/30">
            <div className="text-2xl font-bold text-orange-700">
              {ALL_PROJECTS.reduce((sum, p) => sum + p.openPositions.length, 0)}
            </div>
            <div className="text-sm text-orange-600">Open Positions</div>
          </Card>
          <Card className="border-0 p-4 ring-1 ring-purple-200/50 bg-purple-50/30">
            <div className="text-2xl font-bold text-purple-700">
              {ALL_PROJECTS.reduce((sum, p) => sum + p.teamSize, 0)}
            </div>
            <div className="text-sm text-purple-600">Total Collaborators</div>
          </Card>
        </div>

        <section aria-label="Projects" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} density={density} />
          ))}
          {projects.length === 0 ? (
            <Card className="col-span-full grid place-items-center rounded-2xl border-0 p-8 text-sm text-muted-foreground ring-1 ring-black/5">
              No projects match your filters. Try adjusting your search criteria.
            </Card>
          ) : null}
        </section>
      </div>
    </main>
  )
}