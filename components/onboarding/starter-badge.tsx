"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Code, Smile, Lightbulb, Moon, Coffee, Zap } from "lucide-react"

const starterBadges = [
  { id: "beginner", name: "Beginner", icon: Code, description: "Just starting the journey" },
  { id: "meme-lord", name: "Meme Lord", icon: Smile, description: "Bringing the laughs" },
  { id: "problem-solver", name: "Problem Solver", icon: Lightbulb, description: "Love tackling challenges" },
  { id: "dark-mode-lover", name: "Dark Mode Lover", icon: Moon, description: "Dark theme all the way" },
  { id: "coffee-addict", name: "Coffee Addict", icon: Coffee, description: "Powered by caffeine" },
  { id: "speed-coder", name: "Speed Coder", icon: Zap, description: "Fast and efficient" },
]

interface StarterBadgeProps {
  data: any
  onNext: (data: any) => void
  onBack?: () => void
}

export function StarterBadge({ data, onNext, onBack }: StarterBadgeProps) {
  const [selectedBadge, setSelectedBadge] = useState(data.starterBadge || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({ starterBadge: selectedBadge })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Pick Your Starter Badge</h3>
        <p className="text-gray-600">Choose a badge that represents you!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {starterBadges.map((badge) => {
          const IconComponent = badge.icon
          return (
            <Card
              key={badge.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedBadge === badge.id ? "ring-2 ring-emerald-500 bg-emerald-50" : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedBadge(badge.id)}
            >
              <CardContent className="p-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className={`p-3 rounded-full ${selectedBadge === badge.id ? "bg-emerald-100" : "bg-gray-100"}`}>
                    <IconComponent
                      className={`w-6 h-6 ${selectedBadge === badge.id ? "text-emerald-600" : "text-gray-600"}`}
                    />
                  </div>
                  <h4 className="font-semibold">{badge.name}</h4>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-between pt-6">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 ml-auto" disabled={!selectedBadge}>
          Continue
        </Button>
      </div>
    </form>
  )
}
