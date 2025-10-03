"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PostSkeleton() {
  return (
  <div className="grid gap-3 md:gap-4 w-full max-w-full">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-0 ring-1 ring-black/5 w-full max-w-full overflow-hidden">
          <CardContent className="p-3 md:p-4 w-full max-w-full overflow-hidden">
            <div className="flex items-start gap-3 w-full min-w-0 max-w-full overflow-hidden">
              {/* Avatar */}
              <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full flex-shrink-0" />
              
              <div className="flex-1 min-w-0 max-w-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2 min-w-0 max-w-full">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                
                {/* Content */}
                <div className="space-y-2 mb-3 w-full max-w-full overflow-hidden">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between w-full max-w-full">
                  <div className="flex items-center gap-4 w-full max-w-full">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-8" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}