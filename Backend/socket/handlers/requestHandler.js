import Request from '../../models/Request.model.js';
import Donation from '../../models/Donation.model.js';
import { getIO } from '../socketServer.js';

/**
 * Handle new donation request
 * Notifies the donor when a recipient requests their donation
 */
export const handleNewRequest = async (requestId) => {
  try {
    const request = await Request.findById(requestId)
      .populate('donation', 'title donor')
      .populate('recipient', 'name email');

    if (!request || !request.donation) {
      return;
    }

    const donorId = request.donation.donor.toString();
    const io = getIO();

    // Emit to the donor's room
    io.to(`user:${donorId}`).emit('new_request', {
      type: 'new_request',
      message: `${request.recipient.name} has requested your donation: ${request.donation.title}`,
      request: {
        id: request._id,
        donationId: request.donation._id,
        recipientName: request.recipient.name,
        status: request.status,
        createdAt: request.createdAt
      }
    });
  } catch (error) {
    console.error('Error in handleNewRequest:', error);
  }
};

/**
 * Handle request status update
 * Notifies both donor and recipient when request status changes
 */
export const handleRequestStatusUpdate = async (requestId, newStatus) => {
  try {
    const request = await Request.findById(requestId)
      .populate('donation', 'title donor')
      .populate('recipient', 'name email');

    if (!request || !request.donation) {
      return;
    }

    const donorId = request.donation.donor.toString();
    const recipientId = request.recipient._id.toString();
    const io = getIO();

    // Notify donor
    io.to(`user:${donorId}`).emit('request_status_update', {
      type: 'request_status_update',
      message: `Request status updated to: ${newStatus}`,
      request: {
        id: request._id,
        donationId: request.donation._id,
        status: newStatus,
        recipientName: request.recipient.name
      }
    });

    // Notify recipient
    io.to(`user:${recipientId}`).emit('request_status_update', {
      type: 'request_status_update',
      message: `Your request status has been updated to: ${newStatus}`,
      request: {
        id: request._id,
        donationId: request.donation._id,
        status: newStatus,
        donationTitle: request.donation.title
      }
    });
  } catch (error) {
    console.error('Error in handleRequestStatusUpdate:', error);
  }
};

