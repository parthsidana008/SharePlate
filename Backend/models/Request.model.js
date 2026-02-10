import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Ready for Pickup', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  message: {
    type: String,
    trim: true,
    maxlength: [200, 'Message cannot be more than 200 characters']
  },
  pickupTime: {
    type: Date
  },
  completedAt: {
    type: Date
  },
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

const Request = mongoose.model('Request', requestSchema);

export default Request;

