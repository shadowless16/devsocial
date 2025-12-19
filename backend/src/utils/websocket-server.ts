import { Server, WebSocket } from 'ws'
import { Server as HttpServer } from 'http'
import jwt from 'jsonwebtoken'

interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean
  userId?: string
}

export class WebSocketService {
  private wss: Server

  constructor(server: HttpServer) {
    this.wss = new Server({ server })
    this.init()
  }

  private init() {
    this.wss.on('connection', (ws: ExtendedWebSocket, req) => {
      console.log('New WebSocket connection established')
      ws.isAlive = true

      ws.on('pong', () => {
        ws.isAlive = true
      })

      ws.on('message', (message: string) => {
        try {
          const parsed = JSON.parse(message.toString())
          
          if (parsed.type === 'auth' && parsed.payload?.token) {
             try {
                const decoded = jwt.verify(parsed.payload.token, process.env.JWT_SECRET || 'secret') as any
                ws.userId = decoded.id
                console.log(`WebSocket authenticated for user: ${ws.userId}`)
             } catch (e) {
                console.error('WebSocket auth failed')
             }
          }
        } catch (e) {
          // Ignore parse errors
        }
      })
    })

    const interval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        const extWs = ws as ExtendedWebSocket
        if (!extWs.isAlive) return ws.terminate()
        
        extWs.isAlive = false
        ws.ping()
      })
    }, 30000)

    this.wss.on('close', () => {
      clearInterval(interval)
    })
  }

  public broadcast(type: string, payload: any) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, payload }))
      }
    })
  }

  public sendToUser(userId: string, type: string, payload: any) {
    this.wss.clients.forEach((client) => {
      const extWs = client as ExtendedWebSocket
      if (extWs.readyState === WebSocket.OPEN && extWs.userId === userId) {
        client.send(JSON.stringify({ type, payload }))
      }
    })
  }
}

let wsService: WebSocketService | null = null

export const initWebSocket = (server: HttpServer) => {
  wsService = new WebSocketService(server)
  return wsService
}

export const getWebSocketService = () => {
  if (!wsService) {
    throw new Error('WebSocket service not initialized')
  }
  return wsService
}
