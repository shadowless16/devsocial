"use client"

import Link from "next/link"

interface MentionTextProps {
  text: string
  className?: string
}

export function MentionText({ text, className = "" }: MentionTextProps) {
  const parts = text.split(/(https?:\/\/[^\s]+|@[a-zA-Z0-9_]+|#[a-zA-Z0-9_]+)/g)
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('http://') || part.startsWith('https://')) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          )
        }
        if (part.startsWith('@')) {
          return (
            <Link
              key={index}
              href={`/profile/${part.substring(1)}`}
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          )
        }
        if (part.startsWith('#')) {
          return (
            <Link
              key={index}
              href={`/tag/${part.substring(1)}`}
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </span>
  )
}