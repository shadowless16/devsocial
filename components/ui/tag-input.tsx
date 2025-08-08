"use client"

import { useState, useRef, KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Badge } from "./badge"
import { Input } from "./input"

interface TagInputProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
}

export function TagInput({ tags, onTagsChange, placeholder = "Add tags...", maxTags = 10 }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const addTag = () => {
    const newTag = inputValue.trim().toLowerCase()
    if (newTag && !tags.includes(newTag) && tags.length < maxTags) {
      onTagsChange([...tags, newTag])
      setInputValue("")
    }
  }

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px] focus-within:ring-2 focus-within:ring-blue-500">
      {tags.map((tag, index) => (
        <Badge key={index} variant="secondary" className="flex items-center gap-1">
          #{tag}
          <X
            className="h-3 w-3 cursor-pointer hover:text-red-500"
            onClick={() => removeTag(index)}
          />
        </Badge>
      ))}
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="border-none shadow-none flex-1 min-w-[120px] focus-visible:ring-0"
      />
    </div>
  )
}