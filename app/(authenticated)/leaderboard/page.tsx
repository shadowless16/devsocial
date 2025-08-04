import { EnhancedLeaderboard } from "@/components/leaderboard/enhanced-leaderboard"

export default function LeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-600 mt-2">See how you rank against other developers in the community</p>
      </div>

      <EnhancedLeaderboard />
    </div>
  )
}
