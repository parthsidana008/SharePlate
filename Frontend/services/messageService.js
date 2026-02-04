import api from '../utils/api';

/**
 * Save a chat message to the backend
 * @param {string} requestId - The request ID
 * @param {string} message - The message text
 * @param {string} recipientId - The recipient user ID
 * @returns {Promise} - The saved message
 */
export const saveMessage = async (requestId, message, recipientId) => {
  try {
    const response = await api.post('/messages', {
      requestId,
      message,
      recipientId
    });
    return response.data.data.message;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

/**
 * Get all messages for a specific request
 * @param {string} requestId - The request ID
 * @returns {Promise} - Array of messages
 */
export const getMessages = async (requestId) => {
  try {
    const response = await api.get(`/messages/${requestId}`);
    return response.data.data.messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};
