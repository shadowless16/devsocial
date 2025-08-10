import { Card, CardContent } from '@/components/ui/card'

export function ReferralSkeleton() {
  return (
    <div className="w-full py-4 sm:py-6 px-1 sm:px-4 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Referral Link Card */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3" />
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          </div>
        </CardContent>
      </Card>

      {/* Social Share */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-3" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card>
        <CardContent className="p-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1" />
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1" />
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}