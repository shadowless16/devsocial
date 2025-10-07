"use client"

import { useState, useEffect } from "react"
import { Check, Clock, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PollOption {
  id: string
  text: string
  votes: number
  voters: string[]
}

interface PollSettings {
  multipleChoice: boolean
  maxChoices: number
  showResults: "always" | "afterVote" | "afterEnd"
  allowAddOptions: boolean
}

interface PollData {
  question: string
  options: PollOption[]
  settings: PollSettings
  endsAt?: string
  totalVotes: number
}

interface PollDisplayProps {
  poll: PollData
  userVotes?: string[]
  onVote: (optionIds: string[]) => void
  currentUserId?: string
}

export function PollDisplay({ poll, userVotes = [], onVote, currentUserId }: PollDisplayProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(userVotes)
  const [hasVoted, setHasVoted] = useState(userVotes.length > 0)
  const [timeLeft, setTimeLeft] = useState<string>("")

  const isEnded = poll.endsAt ? new Date(poll.endsAt) < new Date() : false
  const canVote = !hasVoted && !isEnded
  const showResults =
    poll.settings.showResults === "always" ||
    (poll.settings.showResults === "afterVote" && hasVoted) ||
    (poll.settings.showResults === "afterEnd" && isEnded)

  useEffect(() => {
    if (poll.endsAt && !isEnded) {
      const interval = setInterval(() => {
        const now = new Date().getTime()
        const end = new Date(poll.endsAt!).getTime()
        const distance = end - now

        if (distance < 0) {
          setTimeLeft("Poll ended")
          clearInterval(interval)
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24))
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))

          if (days > 0) {
            setTimeLeft(`${days}d ${hours}h left`)
          } else if (hours > 0) {
            setTimeLeft(`${hours}h ${minutes}m left`)
          } else {
            setTimeLeft(`${minutes}m left`)
          }
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [poll.endsAt, isEnded])

  const handleOptionClick = (optionId: string) => {
    if (!canVote) return

    if (poll.settings.multipleChoice) {
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter((id) => id !== optionId))
      } else if (selectedOptions.length < poll.settings.maxChoices) {
        setSelectedOptions([...selectedOptions, optionId])
      }
    } else {
      setSelectedOptions([optionId])
    }
  }

  const handleVote = () => {
    if (selectedOptions.length > 0) {
      onVote(selectedOptions)
      setHasVoted(true)
    }
  }

  const getPercentage = (votes: number) => {
    return poll.totalVotes > 0 ? Math.round((votes / poll.totalVotes) * 100) : 0
  }

  const getWinningOption = () => {
    return poll.options.reduce((max, option) => (option.votes > max.votes ? option : max), poll.options[0])
  }

  const winningOption = getWinningOption()

  return (
    <Card className="p-4 space-y-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 border-blue-200">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg">{poll.question}</h3>
          {poll.endsAt && (
            <Badge variant="outline" className="flex items-center gap-1 flex-shrink-0">
              <Clock className="h-3 w-3" />
              {timeLeft || "Ended"}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
          </span>
          {poll.settings.multipleChoice && (
            <Badge variant="secondary" className="text-xs">
              Choose up to {poll.settings.maxChoices}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {poll.options.map((option) => {
          const percentage = getPercentage(option.votes)
          const isSelected = selectedOptions.includes(option.id)
          const isWinning = showResults && option.id === winningOption.id && poll.totalVotes > 0

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              disabled={!canVote}
              className={cn(
                "w-full text-left p-3 rounded-lg border-2 transition-all relative overflow-hidden",
                canVote && "hover:border-blue-400 cursor-pointer",
                isSelected && canVote && "border-blue-500 bg-blue-50",
                !canVote && "cursor-default",
                isWinning && "border-emerald-400 bg-emerald-50"
              )}
            >
              {showResults && (
                <div
                  className="absolute inset-0 bg-blue-100/40 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {canVote && (
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                  )}
                  <span className="font-medium truncate">{option.text}</span>
                  {isWinning && <TrendingUp className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
                </div>

                {showResults && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold">{percentage}%</span>
                    <span className="text-xs text-muted-foreground">({option.votes})</span>
                  </div>
                )}
              </div>

              {showResults && (
                <Progress value={percentage} className="h-1 mt-2" />
              )}
            </button>
          )
        })}
      </div>

      {canVote && selectedOptions.length > 0 && (
        <Button onClick={handleVote} className="w-full" size="lg">
          Vote {poll.settings.multipleChoice && `(${selectedOptions.length}/${poll.settings.maxChoices})`}
        </Button>
      )}

      {hasVoted && !isEnded && (
        <p className="text-sm text-center text-muted-foreground">
          ✓ You voted for: {poll.options.filter((o) => userVotes.includes(o.id)).map((o) => o.text).join(", ")}
        </p>
      )}

      {isEnded && (
        <Badge variant="secondary" className="w-full justify-center py-2">
          Poll Ended
        </Badge>
      )}
    </Card>
  )
}
