"use client"

import { useState, useEffect, useRef } from "react"
import WebSocketClient from "@/lib/realtime/websocket-client"

interface LeaderboardEntry {
  _id: string
  user: {
    _id: string
    username: string
    displayName: string
    avatar?: string
    level: number
  }
  totalXP: number
  totalPosts?: number
  totalLikes?: number
  totalComments?: number
  referralCount?: number
  challengesCompleted?: number
  firstCompletions?: number
  rank: number
  level: number
}

export function useRealtimeLeaderboard(type: string) {
  const [realtimeData, setRealtimeData] = useState<LeaderboardEntry[] | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const wsClient = useRef<WebSocketClient | null>(null)

  useEffect(() => {
    // Initialize WebSocket connection
    const wsUrl = process.env.NODE_ENV === "production" ? "wss://your-domain.com/ws" : "ws://localhost:3001/ws"

    wsClient.current = new WebSocketClient(wsUrl)

    // Listen for connection status
    wsClient.current.on("connected", (data: Record<string, unknown>) => {
      const connected = data.connected as boolean
      setIsConnected(connected)

      if (connected) {
        // Subscribe to leaderboard updates for current type
        wsClient.current?.send("subscribe", { type: "leaderboard", leaderboardType: type })
      }
    })

    // Listen for leaderboard updates
    wsClient.current.on("leaderboard_update", (data: { type: string; leaderboard: LeaderboardEntry[] }) => {
      if (data.type === type) {
        setRealtimeData(data.leaderboard)
      }
    })

    // Listen for user rank changes
    wsClient.current.on("rank_change", (data: { userId: string; oldRank: number; newRank: number; type: string }) => {
      if (data.type === type) {
        // Trigger a fresh fetch of leaderboard data
        fetchLeaderboardUpdate()
      }
    })

    return () => {
      wsClient.current?.disconnect()
    }
  }, [])

  useEffect(() => {
    // When type changes, subscribe to new leaderboard type
    if (wsClient.current?.isConnected()) {
      wsClient.current.send("subscribe", { type: "leaderboard", leaderboardType: type })
    }
  }, [type])

  const fetchLeaderboardUpdate = async () => {
    try {
      const response = await fetch(`/api/leaderboard?type=${type}&limit=50`)
      const data = await response.json()

      if (data.success) {
        setRealtimeData(data.data.leaderboard)
      }
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error fetching leaderboard update:", errorMessage)
    }
  }

  return {
    realtimeData,
    isConnected,
    refetch: fetchLeaderboardUpdate,
  }
}
