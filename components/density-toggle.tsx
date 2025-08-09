"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export type Density = "compact" | "comfortable"

type Props = {
  value: Density
  onChange: (value: Density) => void
}

export default function DensityToggle({ value, onChange }: Props) {
  return (
    <ToggleGroup type="single" value={value} onValueChange={(v) => v && onChange(v as Density)}>
      <ToggleGroupItem value="compact" aria-label="Compact view">
        Compact
      </ToggleGroupItem>
      <ToggleGroupItem value="comfortable" aria-label="Comfortable view">
        Comfortable
      </ToggleGroupItem>
    </ToggleGroup>
  )
}