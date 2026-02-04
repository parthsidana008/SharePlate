import Message from '../models/Message.model.js';
import Request from '../models/Request.model.js';

/**
 * Save a new chat message
 * POST /api/messages
 */
export const saveMessage = async (req, res) => {
  try {
    const { requestId, message, recipientId } = req.body;
    const senderId = req.user.id;

    // Validate request exists
    const requestDoc = await Request.findById(requestId);
    if (!requestDoc) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Create message
    const newMessage = await Message.create({
      request: requestId,
      sender: senderId,
      recipient: recipientId,
      message: message
    });

    // Populate sender and recipient info
    await newMessage.populate('sender', 'name email');
    await newMessage.populate('recipient', 'name email');

    res.status(201).json({
      success: true,
      data: {
        message: newMessage
      }
    });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save message',
      error: error.message
    });
  }
};

/**
 * Get all messages for a specific request
 * GET /api/messages/:requestId
 */
export const getMessages = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    // Validate request exists and user is authorized
    const requestDoc = await Request.findById(requestId).populate('donation');
    if (!requestDoc) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if user is either the donor or recipient
    const isDonor = requestDoc.donation.donor.toString() === userId;
    const isRecipient = requestDoc.recipient.toString() === userId;

    if (!isDonor && !isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these messages'
      });
    }

    // Fetch messages
    const messages = await Message.find({ request: requestId })
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: 1 });

    // Mark messages as read if user is the recipient
    await Message.updateMany(
      { 
        request: requestId, 
        recipient: userId,
        read: false 
      },
      { read: true }
    );

    res.status(200).json({
      success: true,
      data: {
        messages
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};
