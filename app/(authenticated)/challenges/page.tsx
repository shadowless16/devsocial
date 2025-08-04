import { WeeklyChallenges } from "@/components/challenges/weekly-challenges"

export default function ChallengesPage() {
  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Weekly Challenges</h1>
        <p className="text-gray-600 mt-2">Complete challenges to earn XP, badges, and climb the leaderboard!</p>
      </div>

      <WeeklyChallenges />
    </div>
  )
}
