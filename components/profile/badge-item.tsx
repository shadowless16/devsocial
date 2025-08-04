import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface BadgeData {
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "uncommon" | "rare" | "legendary"
  earnedAt: string
}

interface BadgeItemProps {
  badge: BadgeData
}

export function BadgeItem({ badge }: BadgeItemProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "uncommon":
        return "bg-green-100 text-green-800 border-green-300"
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "legendary":
        return "bg-purple-100 text-purple-800 border-purple-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 text-center">
        <div className="text-3xl mb-3">{badge.icon}</div>
        <h3 className="font-semibold text-gray-900 mb-2">{badge.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{badge.description}</p>
        <div className="space-y-2">
          <Badge className={getRarityColor(badge.rarity)}>{badge.rarity}</Badge>
          <p className="text-xs text-gray-500">Earned {badge.earnedAt}</p>
        </div>
      </CardContent>
    </Card>
  )
}
