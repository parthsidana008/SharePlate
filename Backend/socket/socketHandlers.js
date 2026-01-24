import { getIO } from './socketServer.js';
import { handleChatMessage } from './handlers/chatHandler.js';

/**
 * Main socket connection handler
 */
export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.user.id;
    const userName = socket.user.name;

    console.log(`✅ User connected: ${userName} (${userId})`);

    // Join user's personal room for notifications
    socket.join(`user:${userId}`);

    // Handle chat messages
    handleChatMessage(socket, io);

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { recipientId, isTyping } = data;
      if (recipientId) {
        socket.to(`user:${recipientId}`).emit('user_typing', {
          userId,
          userName,
          isTyping
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${userName} (${userId})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

