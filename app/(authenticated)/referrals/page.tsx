import { ReferralDashboard } from "@/components/referrals/referral-dashboard"

export default function ReferralsPage() {
  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
        <p className="text-gray-600 mt-2">Invite friends to join DevSocial and earn rewards together!</p>
      </div>

      <ReferralDashboard />
    </div>
  )
}
