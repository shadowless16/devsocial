"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export type ProjectFiltersState = {
  techStack: string
  projectType: string
  status: string
  timeCommitment: string
  experienceLevel: string
}

type Props = {
  value: ProjectFiltersState
  onChange: (filters: ProjectFiltersState) => void
}

export default function ProjectsFilters({ value, onChange }: Props) {
  const updateFilter = (key: keyof ProjectFiltersState, newValue: string) => {
    onChange({ ...value, [key]: newValue })
  }

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          className="pl-9 bg-white"
        />
      </div>
      
      <Select value={value.techStack} onValueChange={(val) => updateFilter("techStack", val)}>
        <SelectTrigger className="w-[140px] bg-white">
          <SelectValue placeholder="Tech Stack" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tech</SelectItem>
          <SelectItem value="react">React</SelectItem>
          <SelectItem value="vue">Vue.js</SelectItem>
          <SelectItem value="angular">Angular</SelectItem>
          <SelectItem value="node">Node.js</SelectItem>
          <SelectItem value="python">Python</SelectItem>
          <SelectItem value="typescript">TypeScript</SelectItem>
        </SelectContent>
      </Select>

      <Select value={value.projectType} onValueChange={(val) => updateFilter("projectType", val)}>
        <SelectTrigger className="w-[130px] bg-white">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="startup">Startup</SelectItem>
          <SelectItem value="open-source">Open Source</SelectItem>
          <SelectItem value="learning">Learning</SelectItem>
          <SelectItem value="freelance">Freelance</SelectItem>
        </SelectContent>
      </Select>

      <Select value={value.status} onValueChange={(val) => updateFilter("status", val)}>
        <SelectTrigger className="w-[120px] bg-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="planning">Planning</SelectItem>
          <SelectItem value="in-development">In Development</SelectItem>
          <SelectItem value="mvp-ready">MVP Ready</SelectItem>
          <SelectItem value="looking-for-funding">Looking for Funding</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={value.timeCommitment} onValueChange={(val) => updateFilter("timeCommitment", val)}>
        <SelectTrigger className="w-[130px] bg-white">
          <SelectValue placeholder="Time" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="part-time">Part-time</SelectItem>
          <SelectItem value="full-time">Full-time</SelectItem>
          <SelectItem value="weekend">Weekend</SelectItem>
          <SelectItem value="long-term">Long-term</SelectItem>
        </SelectContent>
      </Select>

      <Select value={value.experienceLevel} onValueChange={(val) => updateFilter("experienceLevel", val)}>
        <SelectTrigger className="w-[130px] bg-white">
          <SelectValue placeholder="Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="beginner">Beginner</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="advanced">Advanced</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}