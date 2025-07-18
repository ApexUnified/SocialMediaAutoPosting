import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [{
    type: String,
    url: String
  }],
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const reservationSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  service: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    start: String,
    end: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    patient: String,
    hospital: String
  },
  chat: {
    messages: [messageSchema],
    isActive: {
      type: Boolean,
      default: true
    },
    lastMessageAt: Date
  },
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    date: Date,
    notes: String
  },
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reservationSchema.index({ hospital: 1, date: 1 });
reservationSchema.index({ patient: 1, status: 1 });
reservationSchema.index({ 'chat.lastMessageAt': -1 });

const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation; 