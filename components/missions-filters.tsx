"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type MissionFiltersState = {
  type: "all" | "achievement" | "learning" | "content"
  difficulty: "all" | "beginner" | "intermediate" | "advanced" | "expert"
  duration: "all" | "weekly" | "monthly" | "permanent"
}

type Props = {
  value?: MissionFiltersState
  onChange?: (next: MissionFiltersState) => void
}

export default function MissionsFilters({
  value = { type: "all", difficulty: "all", duration: "all" },
  onChange = () => {},
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Select value={value.type} onValueChange={(type: MissionFiltersState["type"]) => onChange({ ...value, type })}>
        <SelectTrigger className="h-10 rounded-xl bg-background">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="achievement">Achievement</SelectItem>
          <SelectItem value="learning">Learning</SelectItem>
          <SelectItem value="content">Content</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={value.difficulty}
        onValueChange={(difficulty: MissionFiltersState["difficulty"]) => onChange({ ...value, difficulty })}
      >
        <SelectTrigger className="h-10 rounded-xl bg-background">
          <SelectValue placeholder="All Difficulties" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Difficulties</SelectItem>
          <SelectItem value="beginner">Beginner</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="advanced">Advanced</SelectItem>
          <SelectItem value="expert">Expert</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={value.duration}
        onValueChange={(duration: MissionFiltersState["duration"]) => onChange({ ...value, duration })}
      >
        <SelectTrigger className="h-10 rounded-xl bg-background">
          <SelectValue placeholder="All Durations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Durations</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="permanent">Permanent</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}