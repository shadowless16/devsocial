import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}