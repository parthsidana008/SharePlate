import { getIO } from '../socketServer.js';

/**
 * Handle chat messages between donor and recipient
 */
export const handleChatMessage = (socket, io) => {
  socket.on('send_message', async (data) => {
    try {
      const { recipientId, message, requestId, donationId } = data;

      if (!recipientId || !message) {
        socket.emit('error', { message: 'Recipient ID and message are required' });
        return;
      }

      const messageData = {
        id: Date.now().toString(),
        senderId: socket.user.id,
        senderName: socket.user.name,
        recipientId,
        message,
        requestId,
        donationId,
        timestamp: new Date()
      };

      // Send to recipient
      console.log(`Sending message to user:${recipientId}`, messageData);
      io.to(`user:${recipientId}`).emit('receive_message', messageData);

      // Send confirmation to sender (echo back their own message)
      socket.emit('message_sent', messageData);
    } catch (error) {
      console.error('Error in handleChatMessage:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
};

