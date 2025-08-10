import { EnhancedLeaderboard } from "@/components/leaderboard/enhanced-leaderboard"

export default function LeaderboardPage() {
  return (
    <div className="w-full py-4 sm:py-6 px-3 sm:px-4">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">See how you rank against other developers in the community</p>
      </div>

      <EnhancedLeaderboard />
    </div>
  )
}
