import { Card, CardContent } from '@/components/ui/card'

export function TrendingSkeleton() {
  return (
    <div className="w-full py-4 sm:py-6 px-1 sm:px-4 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
        <div className="flex gap-2 overflow-x-auto">
          {['Today', 'Week', 'Month'].map(i => (
            <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Trending Posts */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3" />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                    </div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}