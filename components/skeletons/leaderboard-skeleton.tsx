import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function LeaderboardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-24" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-48 mt-1" />
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>

        {/* Leaderboard entries */}
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border rounded-lg">
              {/* Rank */}
              <Skeleton className="h-5 w-5 flex-shrink-0" />
              
              {/* Avatar */}
              <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0" />
              
              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Skeleton className="h-4 w-20 sm:w-32" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-3 w-16 sm:w-24" />
              </div>
              
              {/* Stats */}
              <div className="flex items-center space-x-3 sm:space-x-6">
                <div className="text-center">
                  <Skeleton className="h-4 w-12 mb-1" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="text-center hidden sm:block">
                  <Skeleton className="h-4 w-8 mb-1" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <div className="text-center hidden sm:block">
                  <Skeleton className="h-4 w-8 mb-1" />
                  <Skeleton className="h-3 w-10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}