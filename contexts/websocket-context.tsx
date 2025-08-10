"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./auth-context"

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
  sendMessage: (event: string, data: any) => void
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const token = localStorage.getItem("auth_token")
      if (token) {
        const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000", {
          auth: { token },
          transports: ['websocket'],
          upgrade: false,
          rememberUpgrade: false
        })

        newSocket.on("connect", () => {
          console.log("Connected to WebSocket server")
          setIsConnected(true)
          // Join user's personal room immediately
          newSocket.emit("join_user_room", user.id)
          
          // Test event listener
          newSocket.on('follow_update', (data) => {
            console.log('WebSocket received follow_update:', data)
          })
        })

        newSocket.on("disconnect", () => {
          console.log("Disconnected from WebSocket server")
          setIsConnected(false)
        })

        newSocket.on("error", (error) => {
          console.error("WebSocket error:", error)
        })



        setSocket(newSocket)

        return () => {
          newSocket.close()
        }
      }
    } else {
      if (socket) {
        socket.close()
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [user])

  const sendMessage = (event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data)
    }
  }

  const joinConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit("join_conversation", conversationId)
    }
  }

  const leaveConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit("leave_conversation", conversationId)
    }
  }

  const value = {
    socket,
    isConnected,
    sendMessage,
    joinConversation,
    leaveConversation,
  }

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }
  return context
}
