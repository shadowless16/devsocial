"use client"

import Link from "next/link"

interface MentionTextProps {
  text: string
  className?: string
}

export function MentionText({ text, className = "" }: MentionTextProps) {
  // Split text by mentions and hashtags and create clickable links
  // Updated regex to handle hashtags and mentions with better word boundaries
  const parts = text.split(/(@[a-zA-Z0-9_]+|#[a-zA-Z0-9_]+)/g)
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          const username = part.substring(1)
          return (
            <Link
              key={index}
              href={`/profile/${username}`}
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          )
        }
        if (part.startsWith('#')) {
          const hashtag = part.substring(1)
          return (
            <Link
              key={index}
              href={`/tag/${hashtag}`}
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