import { Card, CardContent } from '@/components/ui/card'

export function MissionsSkeleton() {
  return (
    <div className="w-full py-4 sm:py-6 px-1 sm:px-4 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
      </div>

      {/* Mission Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['Daily', 'Weekly', 'Monthly', 'Special'].map(i => (
          <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 flex-shrink-0" />
        ))}
      </div>

      {/* Active Mission Banner */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          </div>
        </CardContent>
      </Card>

      {/* Missions List */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3" />
                  
                  {/* Progress */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                  </div>
                  
                  {/* Rewards */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
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