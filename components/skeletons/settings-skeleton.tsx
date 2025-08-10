import { Card, CardContent } from '@/components/ui/card'

export function SettingsSkeleton() {
  return (
    <div className="w-full py-4 sm:py-6 px-1 sm:px-4 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      </div>

      {/* Settings Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['Profile', 'Account', 'Privacy', 'Notifications'].map(i => (
          <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 flex-shrink-0" />
        ))}
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardContent className="p-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                </div>
              </div>
              
              {/* Form Fields */}
              {[1, 2, 3, 4].map(i => (
                <div key={i}>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardContent className="p-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardContent className="p-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-1" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-56" />
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                </div>
                <div className="h-8 bg-red-200 dark:bg-red-800 rounded w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}