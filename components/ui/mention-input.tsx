"use client"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "./textarea"

interface User {
  username: string
  displayName?: string
  avatar: string
}

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function MentionInput({ value, onChange, placeholder, className }: MentionInputProps) {
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mentionStart, setMentionStart] = useState(-1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load followed users when @ is typed without query
  const loadFollowedUsers = async () => {
    try {
      const response = await fetch(`/api/users/search?limit=8`)
      const data = await response.json()
      if (response.ok) {
        setSuggestions(data.users || [])
      }
    } catch (error) {
      console.error("Error loading followed users:", error)
    }
  }

  const searchUsers = async (query: string) => {
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=8`)
      const data = await response.json()
      if (response.ok) {
        setSuggestions(data.users || [])
      }
    } catch (error) {
      console.error("Error searching users:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const cursorPos = e.target.selectionStart
    
    onChange(newValue)

    // Check for @ mentions
    const textBeforeCursor = newValue.substring(0, cursorPos)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      const query = mentionMatch[1]
      setMentionStart(cursorPos - mentionMatch[0].length)
      setShowSuggestions(true)
      setSelectedIndex(0)
      
      if (query.length === 0) {
        // Show followed users when just @ is typed
        loadFollowedUsers()
      } else {
        // Search for users as they type
        searchUsers(query)
      }
    } else {
      setShowSuggestions(false)
      setSuggestions([])
    }
  }

  const insertMention = (user: User) => {
    if (mentionStart === -1) return

    const beforeMention = value.substring(0, mentionStart)
    const afterCursor = value.substring(textareaRef.current?.selectionStart || 0)
    const newValue = `${beforeMention}@${user.username} ${afterCursor}`
    
    onChange(newValue)
    setShowSuggestions(false)
    setSuggestions([])
    setMentionStart(-1)
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const newCursorPos = mentionStart + user.username.length + 2
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 10)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % suggestions.length)
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
        break
      case "Enter":
      case "Tab":
        e.preventDefault()
        insertMention(suggestions[selectedIndex])
        break
      case "Escape":
        setShowSuggestions(false)
        break
    }
  }

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((user, index) => (
            <div
              key={user.username}
              className={`px-3 py-2 cursor-pointer flex items-center gap-2 ${
                index === selectedIndex ? "bg-blue-50 border-l-2 border-blue-500" : "hover:bg-gray-50"
              }`}
              onMouseDown={(e) => {
                e.preventDefault()
                insertMention(user)
              }}
            >
              <img
                src={user.avatar?.includes('models.readyplayer.me') && user.avatar.endsWith('.glb') 
                  ? user.avatar.replace('.glb', '.png') 
                  : user.avatar || "/placeholder.svg"}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
              <div className="flex-1">
                <div className="font-medium text-sm">@{user.username}</div>
                {user.displayName && (
                  <div className="text-xs text-gray-500">{user.displayName}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}