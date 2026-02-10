import Donation from '../models/Donation.model.js';

// @desc    Get all donations
// @route   GET /api/donations
// @access  Private
export const getDonations = async (req, res) => {
  const startTime = Date.now();
  try {
    const { type, location, status } = req.query;
    
    const query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (location) {
      query.$or = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.area': new RegExp(location, 'i') },
        { 'location.zipCode': location }
      ];
    }

    console.log(`[getDonations] Query started at ${new Date().toISOString()}`);
    
    const donations = await Donation.find(query)
      .populate('donor', 'name email verified')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    console.log(`[getDonations] Query completed in ${Date.now() - startTime}ms, found ${donations.length} donations`);

    res.status(200).json({
      success: true,
      count: donations.length,
      data: {
        donations
      }
    });
  } catch (error) {
    console.error(`[getDonations] Error after ${Date.now() - startTime}ms:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching donations'
    });
  }
};

// @desc    Get single donation
// @route   GET /api/donations/:id
// @access  Private
export const getDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email verified location');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        donation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching donation'
    });
  }
};

// @desc    Create new donation
// @route   POST /api/donations
// @access  Private (Donor/Admin)
export const createDonation = async (req, res) => {
  try {
    const donationData = {
      ...req.body,
      donor: req.user.id,
      donorName: req.user.name
    };

    const donation = await Donation.create(donationData);

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: {
        donation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating donation'
    });
  }
};

// @desc    Update donation
// @route   PUT /api/donations/:id
// @access  Private (Owner/Admin)
export const updateDonation = async (req, res) => {
  try {
    let donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check if user is owner or admin
    if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this donation'
      });
    }

    donation = await Donation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Donation updated successfully',
      data: {
        donation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating donation'
    });
  }
};

// @desc    Delete donation
// @route   DELETE /api/donations/:id
// @access  Private (Owner/Admin)
export const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('requests');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check if user is owner or admin
    if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this donation'
      });
    }

    // Check if any requests are in Confirmed or later statuses
    const activeRequests = donation.requests.filter(req => 
      req.status && ['Confirmed', 'Ready for Pickup', 'Completed'].includes(req.status)
    );

    if (activeRequests.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete donation with accepted requests. Please cancel the accepted request(s) first.'
      });
    }

    // Delete all associated requests (Pending, Cancelled)
    if (donation.requests && donation.requests.length > 0) {
      const Request = await import('../models/Request.model.js').then(m => m.default);
      await Request.deleteMany({ donation: req.params.id });
    }

    await donation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Donation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting donation'
    });
  }
};

// @desc    Get my donations
// @route   GET /api/donations/my/list
// @access  Private (Donor)
export const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({
      success: true,
      count: donations.length,
      data: {
        donations
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching donations'
    });
  }
};

