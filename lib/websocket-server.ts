// WebSocket server utility with controlled logging
import { Server as SocketIOServer } from 'socket.io';
import { logger } from './logger';

const isDev = process.env.NODE_ENV === 'development';
const shouldLogConnections = process.env.LOG_WEBSOCKET === 'true';

export function setupWebSocketLogging(io: SocketIOServer) {
  io.on('connection', (socket) => {
    if (shouldLogConnections) {
      logger.info(`User connected: ${socket.id}`);
    }

    socket.on('join_user_room', (userId: string) => {
      socket.join(`user_${userId}`);
      if (shouldLogConnections) {
        logger.info(`User ${userId} joined room user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      if (shouldLogConnections) {
        logger.info(`User disconnected: ${socket.id}`);
      }
    });
  });
}