import { Card, CardContent } from '@/components/ui/card'

export function ProjectsSkeleton() {
  return (
    <div className="w-full py-4 sm:py-6 px-1 sm:px-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-28" />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['All', 'Active', 'Completed', 'Archived'].map(i => (
          <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 flex-shrink-0" />
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
              
              {/* Tech Stack */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                ))}
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}