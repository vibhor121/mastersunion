import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

let io;
const userSockets = new Map(); // Map userId to socket.id

/**
 * Initialize Socket.io
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      return next(new Error('Invalid token'));
    }
  });

  // Socket connection handler
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} for user ${socket.userId}`);

    // Store user socket mapping
    userSockets.set(socket.userId, socket.id);

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected to CRM real-time server',
      userId: socket.userId,
    });

    // Handle user joining specific rooms (e.g., lead rooms)
    socket.on('join:lead', (leadId) => {
      socket.join(`lead:${leadId}`);
      logger.info(`User ${socket.userId} joined lead room: ${leadId}`);
    });

    socket.on('leave:lead', (leadId) => {
      socket.leave(`lead:${leadId}`);
      logger.info(`User ${socket.userId} left lead room: ${leadId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id} for user ${socket.userId}`);
      userSockets.delete(socket.userId);
    });

    // Handle custom events
    socket.on('activity:created', (data) => {
      // Broadcast activity creation to all users in the lead room
      socket.to(`lead:${data.leadId}`).emit('activity:new', data);
    });

    socket.on('lead:updated', (data) => {
      // Broadcast lead update to all users in the lead room
      socket.to(`lead:${data.leadId}`).emit('lead:changed', data);
    });
  });

  logger.info('Socket.io initialized successfully');
  return io;
};

/**
 * Emit notification to specific user
 */
export const emitNotification = (userId, notification) => {
  try {
    const socketId = userSockets.get(userId);
    if (socketId && io) {
      io.to(socketId).emit('notification:new', notification);
      logger.debug(`Notification sent to user ${userId}`);
    }
  } catch (error) {
    logger.error('Error emitting notification:', error);
  }
};

/**
 * Emit event to specific lead room
 */
export const emitToLeadRoom = (leadId, event, data) => {
  try {
    if (io) {
      io.to(`lead:${leadId}`).emit(event, data);
      logger.debug(`Event ${event} emitted to lead room ${leadId}`);
    }
  } catch (error) {
    logger.error('Error emitting to lead room:', error);
  }
};

/**
 * Emit event to all connected clients
 */
export const emitToAll = (event, data) => {
  try {
    if (io) {
      io.emit(event, data);
      logger.debug(`Event ${event} emitted to all clients`);
    }
  } catch (error) {
    logger.error('Error emitting to all:', error);
  }
};

/**
 * Get Socket.io instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export default {
  initSocket,
  emitNotification,
  emitToLeadRoom,
  emitToAll,
  getIO,
};

