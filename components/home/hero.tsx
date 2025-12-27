"use client"

import { useAuth } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Sparkles, Trophy, ArrowRight, Zap } from "lucide-react"
import { motion } from "framer-motion"

export function HomeHero() {
  const { user } = useAuth()
  
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 via-primary to-purple-600 p-1 shadow-2xl mb-6">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10 opacity-50 mix-blend-overlay"></div>
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl"></div>
      
      <div className="relative rounded-[20px] bg-black/10 backdrop-blur-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md border border-white/20">
                <Sparkles className="mr-1 h-3 w-3 text-yellow-300" />
                Daily Streak: {user?.loginStreak || 0} days
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            >
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white">{user?.displayName?.split(' ')[0] || "Dev"}</span>!
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-blue-100 max-w-md text-lg"
            >
              Ready to ship some code and inspire the community today?
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hidden sm:block"
          >
             <div className="glass-panel p-4 rounded-2xl bg-white/10 border-white/20 text-white min-w-[160px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-400/20 rounded-lg">
                    <Trophy className="h-5 w-5 text-yellow-300" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-100">Current Rank</div>
                    <div className="font-bold">L{user?.level || 1} Developer</div>
                  </div>
                </div>
                <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-yellow-300 to-yellow-500 h-full rounded-full" 
                    style={{ width: `${(user?.points || 0) % 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-blue-100">
                  <span>{user?.points || 0} XP</span>
                  <span>{1000} XP (Next Level)</span>
                </div>
             </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex gap-3"
        >
          <Button className="bg-white text-primary hover:bg-blue-50 font-semibold rounded-xl h-11 shadow-lg shadow-black/10 border-0">
            <Zap className="mr-2 h-4 w-4 fill-primary" /> Start Challenge
          </Button>
          <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white rounded-xl h-11">
            View Analytics <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
