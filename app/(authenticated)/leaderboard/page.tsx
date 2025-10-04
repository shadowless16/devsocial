import { EnhancedLeaderboard } from "@/components/leaderboard/enhanced-leaderboard"

export default function LeaderboardPage() {
  return (
    <div className="w-full max-w-4xl mx-auto py-2 sm:py-4 px-2 sm:px-4">
      <div className="mb-3 sm:mb-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">See how you rank against other developers</p>
      </div>

      <EnhancedLeaderboard />
    </div>
  )
}
