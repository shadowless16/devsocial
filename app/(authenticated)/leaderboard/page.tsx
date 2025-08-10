import { EnhancedLeaderboard } from "@/components/leaderboard/enhanced-leaderboard"

export default function LeaderboardPage() {
  return (
    <div className="w-full py-4 sm:py-6 px-1 sm:px-4">
      <div className="mb-4 sm:mb-6 px-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">See how you rank against other developers</p>
      </div>

      <EnhancedLeaderboard />
    </div>
  )
}
