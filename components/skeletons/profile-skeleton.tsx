import { Card, CardContent } from '@/components/ui/card'

export function ProfileSkeleton() {
  return (
    <div className="w-full py-4 sm:py-6 px-1 sm:px-4 animate-pulse">
      {/* Profile Header Skeleton */}
      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
            
            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                </div>
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded ml-2" />
              </div>
              
              {/* Location & Join Date */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              </div>
              
              {/* Bio */}
              <div className="space-y-2 mb-3">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
              
              {/* Follow Stats */}
              <div className="flex gap-4 mb-3">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
              
              {/* Tech Stack */}
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-3">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        ))}
      </div>

      {/* Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column - Achievements */}
        <div className="lg:col-span-4">
          <Card>
            <CardContent className="p-4">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1" />
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity Feed */}
        <div className="lg:col-span-8">
          <Card>
            <CardContent className="p-4">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-b-0">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                        <div className="flex gap-4">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}