"use client"

import { useState, useRef } from "react"
// import Image from 'next/image';
import { Input } from "@/components/ui/input"

interface User {
  username: string
  displayName?: string
  avatar: string
}

interface UsernameInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function UsernameInput({ value, onChange, placeholder, className }: UsernameInputProps) {
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=5`)
      const data = await response.json()
      if (response.ok) {
        setSuggestions(data.users || [])
        setShowSuggestions(data.users?.length > 0)
        setSelectedIndex(0)
      }
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error searching users:", errorMessage)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    searchUsers(newValue)
  }

  const selectUser = (user: User) => {
    onChange(user.username)
    setShowSuggestions(false)
    setSuggestions([])
  }



  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}

        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onFocus={() => value && searchUsers(value)}
        placeholder={placeholder}
        className={className}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((user, index) => (
            <div
              key={user.username}
              className={`px-3 py-2 cursor-pointer flex items-center gap-2 ${
                index === selectedIndex ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
              onClick={() => selectUser(user)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar}
                alt={user.username}
                className="w-6 h-6 rounded-full"
              />
              <div>
                <div className="font-medium text-sm">{user.username}</div>
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