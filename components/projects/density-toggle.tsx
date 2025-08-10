"use client"

import { Button } from "@/components/ui/button"
import { Grid2X2, List } from "lucide-react"

export type Density = "compact" | "comfortable"

type Props = {
  value: Density
  onChange: (density: Density) => void
}

export default function DensityToggle({ value, onChange }: Props) {
  return (
    <div className="flex items-center rounded-lg border bg-white p-1">
      <Button
        variant={value === "compact" ? "default" : "ghost"}
        size="sm"
        className={`h-7 px-2 ${
          value === "compact" 
            ? "bg-emerald-600 hover:bg-emerald-600/90 text-white" 
            : "hover:bg-muted"
        }`}
        onClick={() => onChange("compact")}
      >
        <Grid2X2 className="h-3 w-3" />
      </Button>
      <Button
        variant={value === "comfortable" ? "default" : "ghost"}
        size="sm"
        className={`h-7 px-2 ${
          value === "comfortable" 
            ? "bg-emerald-600 hover:bg-emerald-600/90 text-white" 
            : "hover:bg-muted"
        }`}
        onClick={() => onChange("comfortable")}
      >
        <List className="h-3 w-3" />
      </Button>
    </div>
  )
}