import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4().slice(0, 8).toUpperCase()
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minPurchase: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: 1
  },
  usageCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String
  },
  conditions: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    url: String,
    caption: String
  },
  location: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    radius: Number, // in meters
    floor: String
  },
  usage: {
    totalUses: {
      type: Number,
      default: 0
    },
    usedBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      usedAt: Date,
      status: {
        type: String,
        enum: ['valid', 'expired', 'cancelled'],
        default: 'valid'
      }
    }]
  },
  qrCode: {
    code: String,
    url: String,
    lastGenerated: Date
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  restrictions: {
    services: [String],
    userTypes: [String]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
couponSchema.index({ hospital: 1, status: 1 });
couponSchema.index({ 'startDate': 1 });
couponSchema.index({ 'endDate': 1 });
couponSchema.index({ 'location.coordinates': '2dsphere' });

// Generate QR code for coupon
couponSchema.methods.generateQRCode = async function() {
  try {
    const couponData = {
      code: this.code,
      hospital: this.hospital,
      type: this.type,
      value: this.value
    };
    return await QRCode.toDataURL(JSON.stringify(couponData));
  } catch (error) {
    throw new Error('Error generating QR code');
  }
};

// Check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    this.usageCount < this.usageLimit
  );
};

// Calculate discount amount
couponSchema.methods.calculateDiscount = function(amount) {
  if (!this.isValid() || amount < this.minPurchase) {
    return 0;
  }

  let discount = this.type === 'percentage' 
    ? (amount * this.value / 100)
    : this.value;

  if (this.maxDiscount) {
    discount = Math.min(discount, this.maxDiscount);
  }

  return discount;
};

// Increment usage count
couponSchema.methods.incrementUsage = async function() {
  if (this.usageCount < this.usageLimit) {
    this.usageCount += 1;
    if (this.usageCount >= this.usageLimit) {
      this.isActive = false;
    }
    await this.save();
    return true;
  }
  return false;
};

// Method to check if user is within location radius
couponSchema.methods.isWithinRadius = function(userLat, userLng) {
  if (!this.location.coordinates || !this.location.radius) return true;
  
  const R = 6371e3; // Earth's radius in meters
  const φ1 = this.location.coordinates.latitude * Math.PI/180;
  const φ2 = userLat * Math.PI/180;
  const Δφ = (userLat - this.location.coordinates.latitude) * Math.PI/180;
  const Δλ = (userLng - this.location.coordinates.longitude) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance <= this.location.radius;
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon; 