"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Flame, Sparkles, ThumbsUp } from "lucide-react"

export default function StatPills() {
  const items = [
    {
      title: "Weekly Challenge",
      description: "Build a REST API with error handling",
      meta: "+100 XP",
      icon: Flame,
      tone: "emerald" as const,
    },
    {
      title: "Today's Prompt",
      description: "Share your biggest coding mistake",
      meta: "+50 XP",
      icon: Sparkles,
      tone: "orange" as const,
    },
    {
      title: "Top Response",
      description: "Always backup before major refactors",
      meta: "Featured",
      icon: ThumbsUp,
      tone: "purple" as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.title}
          className="group relative overflow-hidden border-0 p-4 ring-1 ring-black/5 transition-all hover:shadow-lg/30 motion-safe:hover:-translate-y-[1px]"
        >
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`
                grid h-6 w-6 place-items-center rounded-md
                ${item.tone === "emerald" ? "bg-emerald-100 text-emerald-700" : ""}
                ${item.tone === "orange" ? "bg-orange-100 text-orange-700" : ""}
                ${item.tone === "purple" ? "bg-purple-100 text-purple-700" : ""}
              `}
            >
              <item.icon className="h-4 w-4" />
            </span>
            <Badge
              className={`
                border-0 text-[11px]
                ${item.tone === "emerald" ? "bg-emerald-50 text-emerald-700" : ""}
                ${item.tone === "orange" ? "bg-orange-50 text-orange-700" : ""}
                ${item.tone === "purple" ? "bg-purple-50 text-purple-700" : ""}
              `}
            >
              {item.title}
            </Badge>
          </div>
          <div className="line-clamp-2 text-sm font-medium">{item.description}</div>
          <div
            className={`
              mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium
              ${item.tone === "emerald" ? "bg-emerald-50 text-emerald-700" : ""}
              ${item.tone === "orange" ? "bg-orange-50 text-orange-700" : ""}
              ${item.tone === "purple" ? "bg-purple-50 text-purple-700" : ""}
            `}
          >
            {item.meta}
          </div>

          {/* Accent sheen */}
          <div className="pointer-events-none absolute inset-x-0 -top-12 h-24 translate-y-[-8px] bg-gradient-to-b from-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Card>
      ))}
    </div>
  )
}