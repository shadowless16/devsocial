"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, Trophy, Star, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface XPNotificationProps {
  xpGained: number
  action: string
  levelUp?: boolean
  rankUp?: boolean
  newRank?: string
  badgesEarned?: string[]
  onClose?: () => void
}

export function XPNotification({
  xpGained,
  action,
  levelUp,
  rankUp,
  newRank,
  badgesEarned = [],
  onClose,
}: XPNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const getActionMessage = (action: string) => {
    const messages: Record<string, string> = {
      post_created: "You don yarn! 📝",
      comment_created: "Nice contribution! 💬",
      post_liked: "Someone dey feel your vibe! ❤️",
      daily_login: "Consistent! E dey your body! 📅",
      bug_reported: "You dey secure the house! 🐞",
      weekly_challenge_joined: "Challenge accepted! 🎯",
    }
    return messages[action] || "XP earned!"
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <Card className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg">
            <CardContent className="p-4">
              {/* XP Gained */}
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="font-bold text-lg">+{xpGained} XP</span>
              </div>

              {/* Action Message */}
              <p className="text-sm opacity-90 mb-3">{getActionMessage(action)}</p>

              {/* Level Up */}
              {levelUp && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-2 mb-2 bg-yellow-400 bg-opacity-20 rounded-lg p-2"
                >
                  <Star className="w-4 h-4 text-yellow-300" />
                  <span className="font-semibold text-sm">Level Up! 🎉</span>
                </motion.div>
              )}

              {/* Rank Up */}
              {rankUp && newRank && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-2 mb-2 bg-purple-400 bg-opacity-20 rounded-lg p-2"
                >
                  <Trophy className="w-4 h-4 text-purple-300" />
                  <span className="font-semibold text-sm">New Rank Unlocked! 👑</span>
                </motion.div>
              )}

              {/* Badges Earned */}
              {badgesEarned.length > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-orange-300" />
                    <span className="font-semibold text-sm">New Badge{badgesEarned.length > 1 ? "s" : ""}!</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {badgesEarned.map((badge, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-white bg-opacity-20">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-2 right-2 text-white opacity-70 hover:opacity-100"
              >
                ×
              </button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
