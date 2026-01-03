import Request from '../models/Request.model.js';
import Donation from '../models/Donation.model.js';

// @desc    Create request for donation
// @route   POST /api/requests
// @access  Private (Recipient)
export const createRequest = async (req, res) => {
  try {
    const { donationId, message, pickupTime } = req.body;

    const donation = await Donation.findById(donationId);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    if (donation.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Donation is not available'
      });
    }

    // Check if user already requested this donation
    const existingRequest = await Request.findOne({
      donation: donationId,
      recipient: req.user.id,
      status: { $in: ['Pending', 'Confirmed', 'Ready for Pickup'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You have already requested this donation'
      });
    }

    const request = await Request.create({
      donation: donationId,
      recipient: req.user.id,
      message,
      pickupTime
    });

    // Add request to donation
    donation.requests.push(request._id);
    await donation.save();

    await request.populate('donation', 'title imageUrl donorName location');
    await request.populate('recipient', 'name email');

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      data: {
        request
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating request'
    });
  }
};

// @desc    Get my requests
// @route   GET /api/requests/my
// @access  Private
export const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ recipient: req.user.id })
      .populate('donation', 'title imageUrl donorName location type quantity')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: {
        requests
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching requests'
    });
  }
};

// @desc    Get requests for my donations
// @route   GET /api/requests/donations
// @access  Private (Donor)
export const getDonationRequests = async (req, res) => {
  try {
    const myDonations = await Donation.find({ donor: req.user.id });
    const donationIds = myDonations.map(d => d._id);

    const requests = await Request.find({ donation: { $in: donationIds } })
      .populate('donation', 'title imageUrl')
      .populate('recipient', 'name email phone location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: {
        requests
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching requests'
    });
  }
};

// @desc    Update request status
// @route   PUT /api/requests/:id/status
// @access  Private
export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Ready for Pickup', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const request = await Request.findById(req.params.id)
      .populate('donation');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check authorization
    const isDonor = request.donation.donor.toString() === req.user.id;
    const isRecipient = request.recipient.toString() === req.user.id;

    if (!isDonor && !isRecipient && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }

    // Update status
    request.status = status;
    if (status === 'Completed') {
      request.completedAt = new Date();
      request.donation.status = 'collected';
      await request.donation.save();
    }
    await request.save();

    await request.populate('donation', 'title imageUrl donorName location');
    await request.populate('recipient', 'name email');

    res.status(200).json({
      success: true,
      message: 'Request status updated successfully',
      data: {
        request
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating request'
    });
  }
};

// @desc    Get single request
// @route   GET /api/requests/:id
// @access  Private
export const getRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('donation', 'title imageUrl donorName location type quantity expiresIn')
      .populate('recipient', 'name email phone location');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        request
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching request'
    });
  }
};

