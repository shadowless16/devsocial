"use client"

import { cn } from "@/lib/core/utils"

interface MobileContainerProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function MobileContainer({ 
  children, 
  className,
  noPadding = false 
}: MobileContainerProps) {
  return (
    <div className={cn(
      "w-full max-w-4xl mx-auto",
      !noPadding && "px-3 md:px-6 py-3 md:py-4",
      className
    )}>
      {children}
    </div>
  )
}

interface MobileGridProps {
  children: React.ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4
  gap?: "sm" | "md" | "lg"
}

export function MobileGrid({ 
  children, 
  className,
  cols = 2,
  gap = "md"
}: MobileGridProps) {
  const gapClasses = {
    sm: "gap-1 md:gap-2",
    md: "gap-2 md:gap-4", 
    lg: "gap-3 md:gap-6"
  }
  
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4"
  }
  
  return (
    <div className={cn(
      "grid",
      colClasses[cols],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}

interface MobileCardProps {
  children: React.ReactNode
  className?: string
  padding?: "sm" | "md" | "lg"
}

export function MobileCard({ 
  children, 
  className,
  padding = "md"
}: MobileCardProps) {
  const paddingClasses = {
    sm: "p-2 md:p-3",
    md: "p-3 md:p-4",
    lg: "p-4 md:p-6"
  }
  
  return (
    <div className={cn(
      "bg-card border-0 ring-1 ring-black/5 rounded-lg overflow-hidden",
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}