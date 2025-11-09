'use client'

import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BotBadgeProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function BotBadge({ className, size = 'sm' }: BotBadgeProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 text-xs',
    md: 'h-5 w-5 text-sm',
    lg: 'h-6 w-6 text-base',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-blue-700 dark:text-blue-300',
        className
      )}
      title="Official Bot"
    >
      <Bot className={sizeClasses[size]} />
      <span className={cn('font-medium', sizeClasses[size])}>BOT</span>
    </div>
  )
}
