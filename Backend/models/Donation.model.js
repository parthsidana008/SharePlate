import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  quantity: {
    type: String,
    required: [true, 'Please provide quantity'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Veg', 'Non-Veg', 'Vegan', 'Bakery'],
    required: [true, 'Please provide food type']
  },
  location: {
    city: String,
    area: String,
    zipCode: String,
    fullAddress: String
  },
  expiresIn: {
    type: String,
    required: [true, 'Please provide expiry information']
  },
  imageUrl: {
    type: String,
    default: null
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donorName: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'collected', 'expired'],
    default: 'available'
  },
  requests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
donationSchema.index({ donor: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ status: 1 });
donationSchema.index({ type: 1 });

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;

