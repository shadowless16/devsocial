/**
 * Theme utility functions for consistent dark mode and color theming
 */

import { cn } from "@/lib/utils"

/**
 * Ensures text is properly visible in both light and dark modes
 */
export const themeText = (className?: string) => {
  return cn(
    "text-foreground dark:text-foreground",
    className
  )
}

/**
 * Ensures muted text is properly visible in both light and dark modes
 */
export const themeMutedText = (className?: string) => {
  return cn(
    "text-muted-foreground dark:text-muted-foreground",
    className
  )
}

/**
 * Ensures background is properly themed
 */
export const themeBackground = (className?: string) => {
  return cn(
    "bg-background dark:bg-background",
    className
  )
}

/**
 * Ensures card background is properly themed
 */
export const themeCard = (className?: string) => {
  return cn(
    "bg-card dark:bg-card text-card-foreground dark:text-card-foreground",
    className
  )
}

/**
 * Ensures input styling is consistent with theme
 */
export const themeInput = (className?: string) => {
  return cn(
    "bg-background dark:bg-background text-foreground dark:text-foreground border-input dark:border-input",
    "focus-visible:ring-primary dark:focus-visible:ring-primary",
    "focus-visible:border-primary dark:focus-visible:border-primary",
    "placeholder:text-muted-foreground dark:placeholder:text-muted-foreground",
    className
  )
}

/**
 * Ensures button styling is consistent with theme
 */
export const themeButton = (variant: 'default' | 'secondary' | 'outline' | 'ghost' = 'default', className?: string) => {
  const baseClasses = "focus-visible:ring-primary dark:focus-visible:ring-primary"
  
  const variantClasses = {
    default: "bg-primary dark:bg-primary text-primary-foreground dark:text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/90",
    secondary: "bg-secondary dark:bg-secondary text-secondary-foreground dark:text-secondary-foreground hover:bg-secondary/80 dark:hover:bg-secondary/80",
    outline: "border-input dark:border-input bg-background dark:bg-background hover:bg-accent dark:hover:bg-accent hover:text-accent-foreground dark:hover:text-accent-foreground",
    ghost: "hover:bg-accent dark:hover:bg-accent hover:text-accent-foreground dark:hover:text-accent-foreground"
  }
  
  return cn(
    baseClasses,
    variantClasses[variant],
    className
  )
}

/**
 * Common focus ring styles using primary color
 */
export const themeFocusRing = (className?: string) => {
  return cn(
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    className
  )
}

/**
 * Ensures proper border theming
 */
export const themeBorder = (className?: string) => {
  return cn(
    "border-border dark:border-border",
    className
  )
}