"use client"

import { X } from "lucide-react"
import { Button } from "./button"

interface LinkPreviewCardProps {
  title: string
  description: string
  image?: string
  url: string
  siteName: string
  onRemove: () => void
}

export function LinkPreviewCard({ title, description, image, siteName, onRemove }: LinkPreviewCardProps) {
  return (
    <div className="relative border border-border rounded-lg overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 h-6 w-6 p-0 bg-background/80 hover:bg-background"
      >
        <X className="w-4 h-4" />
      </Button>
      
      <div className="flex gap-3 p-3">
        {image && (
          <div className="flex-shrink-0 w-20 h-20 rounded overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground mb-1">{siteName}</div>
          <div className="font-medium text-sm line-clamp-2 mb-1">{title}</div>
          {description && (
            <div className="text-xs text-muted-foreground line-clamp-2">{description}</div>
          )}
        </div>
      </div>
    </div>
  )
}
