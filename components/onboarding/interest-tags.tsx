"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const availableTags = [
  "#javascript",
  "#cybersecurity",
  "#backend",
  "#design",
  "#productivity",
  "#confession",
  "#events",
  "#schoolLife",
  "#react",
  "#typescript",
  "#nextjs",
  "#tailwind",
  "#python",
  "#ai",
  "#blockchain",
  "#mobile",
  "#webdev",
  "#devops",
]

interface OnboardingData {
  interests?: string[]
}

interface InterestTagsProps {
  data: OnboardingData
  onNext: (data: OnboardingData) => void
  onChange?: (data: OnboardingData) => void
  onBack?: () => void
}

export function InterestTags({ data, onNext, onChange, onBack }: InterestTagsProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(data.interests || [])

  // Update state when data prop changes
  useEffect(() => {
    if (data.interests && Array.isArray(data.interests)) {
      setSelectedTags(data.interests)
    }
  }, [data.interests])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        const next = prev.filter((t) => t !== tag)
        onChange?.({ interests: next })
        return next
      } else if (prev.length < 5) {
        const next = [...prev, tag]
        onChange?.({ interests: next })
        return next
      }
      return prev
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({ interests: selectedTags })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">What interests you?</h3>
        <p className="text-gray-600">Choose 3-5 tags to personalize your feed</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "hover:bg-emerald-50 hover:border-emerald-300"
              }`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">Selected: {selectedTags.length}/5 tags</p>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 ml-auto"
          disabled={selectedTags.length < 3}
        >
          Continue
        </Button>
      </div>
    </form>
  )
}
