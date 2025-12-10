"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, X } from "lucide-react"

interface RewardToastProps {
  xp: number
  badge?: string
  message: string
  onClose?: () => void
}

export function RewardToast({ xp, badge, message, onClose }: RewardToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-2xl p-4 max-w-sm"
        >
          <button
            onClick={() => {
              setIsVisible(false)
              onClose?.()
            }}
            className="absolute top-2 right-2 text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-start gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Trophy className="w-6 h-6" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Reward Unlocked!</h3>
              <p className="text-sm mb-2">{message}</p>
              
              <div className="flex items-center gap-2 text-sm">
                {badge && (
                  <span className="bg-white/20 px-2 py-1 rounded">
                    📸 {badge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                )}
                <span className="bg-white/20 px-2 py-1 rounded font-bold">
                  +{xp} XP
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
