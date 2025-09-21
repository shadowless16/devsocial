"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Target, BookOpen, Code, History, Trophy, Users, GraduationCap } from "lucide-react"

export default function StatPills() {
  const getDailyChallenge = () => {
    const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
    
    const dailyChallenges = [
      {
        day: "Sunday",
        title: "Study Sunday",
        description: "Study groups, coding quizzes, reflection posts",
        hashtag: "#StudySunday",
        xp: "+75 XP",
        icon: GraduationCap,
        tone: "blue" as const,
      },
      {
        day: "Monday",
        title: "Motivation Monday",
        description: "Goal setting, XP for completing weekly goals",
        hashtag: "#MotivationMonday",
        xp: "+50 XP",
        icon: Target,
        tone: "emerald" as const,
      },
      {
        day: "Tuesday",
        title: "Tutorial Tuesday",
        description: "Users post tutorials/resources (XP + badge)",
        hashtag: "#TutorialTuesday",
        xp: "+100 XP",
        icon: BookOpen,
        tone: "orange" as const,
      },
      {
        day: "Wednesday",
        title: "Work-in-Progress Wednesday",
        description: "Share projects, request feedback",
        hashtag: "#WIPWednesday",
        xp: "+60 XP",
        icon: Code,
        tone: "purple" as const,
      },
      {
        day: "Thursday",
        title: "Throwback Thursday",
        description: "Post old projects/code evolution",
        hashtag: "#ThrowbackThursday",
        xp: "+40 XP",
        icon: History,
        tone: "yellow" as const,
      },
      {
        day: "Friday",
        title: "Feature Friday",
        description: "Coding challenges, project showcases, bug hunt",
        hashtag: "#FeatureFriday",
        xp: "+80 XP",
        icon: Trophy,
        tone: "red" as const,
      },
      {
        day: "Saturday",
        title: "Social Saturday",
        description: "Casual chat, memes, gaming sessions",
        hashtag: "#SocialSaturday",
        xp: "+30 XP",
        icon: Users,
        tone: "pink" as const,
      },
    ]
    
    return dailyChallenges[today]
  }

  const todayChallenge = getDailyChallenge()
  const nextDay = (new Date().getDay() + 1) % 7
  const tomorrowChallenge = [
    { day: "Sunday", title: "Study Sunday", hashtag: "#StudySunday", icon: GraduationCap, tone: "blue" as const },
    { day: "Monday", title: "Motivation Monday", hashtag: "#MotivationMonday", icon: Target, tone: "emerald" as const },
    { day: "Tuesday", title: "Tutorial Tuesday", hashtag: "#TutorialTuesday", icon: BookOpen, tone: "orange" as const },
    { day: "Wednesday", title: "Work-in-Progress Wednesday", hashtag: "#WIPWednesday", icon: Code, tone: "purple" as const },
    { day: "Thursday", title: "Throwback Thursday", hashtag: "#ThrowbackThursday", icon: History, tone: "yellow" as const },
    { day: "Friday", title: "Feature Friday", hashtag: "#FeatureFriday", icon: Trophy, tone: "red" as const },
    { day: "Saturday", title: "Social Saturday", hashtag: "#SocialSaturday", icon: Users, tone: "pink" as const },
  ][nextDay]

  const items = [
    {
      title: `Today's Challenge`,
      description: todayChallenge.description,
      meta: todayChallenge.xp,
      hashtag: todayChallenge.hashtag,
      icon: todayChallenge.icon,
      tone: todayChallenge.tone,
      subtitle: todayChallenge.title
    },
    {
      title: "Tomorrow",
      description: `Get ready for ${tomorrowChallenge.title}`,
      meta: "Coming Up",
      hashtag: tomorrowChallenge.hashtag,
      icon: tomorrowChallenge.icon,
      tone: tomorrowChallenge.tone,
      subtitle: tomorrowChallenge.title
    },
    {
      title: "Weekly Streak",
      description: "Complete daily challenges to build your streak",
      meta: "🔥 3 days",
      hashtag: "#WeeklyStreak",
      icon: Trophy,
      tone: "emerald" as const,
      subtitle: "Keep Going!"
    },
  ]

  const getToneClasses = (tone: string) => {
    const classes = {
      emerald: "bg-emerald-100 text-emerald-700",
      orange: "bg-orange-100 text-orange-700",
      purple: "bg-purple-100 text-purple-700",
      blue: "bg-blue-100 text-blue-700",
      yellow: "bg-yellow-100 text-yellow-700",
      red: "bg-red-100 text-red-700",
      pink: "bg-pink-100 text-pink-700",
    }
    return classes[tone as keyof typeof classes] || classes.emerald
  }

  const getBadgeClasses = (tone: string) => {
    const classes = {
      emerald: "bg-emerald-50 text-emerald-700",
      orange: "bg-orange-50 text-orange-700",
      purple: "bg-purple-50 text-purple-700",
      blue: "bg-blue-50 text-blue-700",
      yellow: "bg-yellow-50 text-yellow-700",
      red: "bg-red-50 text-red-700",
      pink: "bg-pink-50 text-pink-700",
    }
    return classes[tone as keyof typeof classes] || classes.emerald
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3 mb-4">
      {items.map((item, index) => (
        <Card
          key={item.title}
          className="group relative overflow-hidden border-0 p-3 sm:p-4 ring-1 ring-black/5 transition-all hover:shadow-lg/30 motion-safe:hover:-translate-y-[1px] cursor-pointer"
          onClick={() => {
            if (index === 0) {
              // Copy hashtag to clipboard for today's challenge
              navigator.clipboard.writeText(item.hashtag)
            }
          }}
        >
          <div className="mb-2 flex items-center gap-1 sm:gap-2">
            <span className={`grid h-5 w-5 sm:h-6 sm:w-6 place-items-center rounded-md ${getToneClasses(item.tone)}`}>
              <item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
            </span>
            <Badge className={`border-0 text-[10px] sm:text-[11px] px-1 sm:px-2 ${getBadgeClasses(item.tone)}`}>
              {item.title}
            </Badge>
          </div>
          <div className="mb-1">
            <div className="text-xs sm:text-sm font-semibold">{item.subtitle}</div>
            <div className="line-clamp-2 text-xs sm:text-sm text-muted-foreground">{item.description}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className={`inline-flex items-center rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-medium ${getBadgeClasses(item.tone)}`}>
              {item.meta}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground font-mono">
              {item.hashtag}
            </div>
          </div>

          {/* Accent sheen */}
          <div className="pointer-events-none absolute inset-x-0 -top-12 h-24 translate-y-[-8px] bg-gradient-to-b from-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Card>
      ))}
    </div>
  )
}