import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  features: {
    reservationSystem: {
      type: Boolean,
      default: false
    },
    qrCoupons: {
      type: Boolean,
      default: false
    },
    blogAutoDistribution: {
      type: Boolean,
      default: false
    },
    blogTranslation: {
      type: Boolean,
      default: false
    },
    appDownload: {
      type: Boolean,
      default: false
    }
  },
  pricing: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly'],
      required: true
    }
  },
  limits: {
    maxReservations: Number,
    maxBlogPosts: Number,
    maxCoupons: Number,
    maxTranslations: Number,
    maxStorage: Number // in MB
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

const subscriptionPlanSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  payment: {
    amount: Number,
    currency: String,
    transactionId: String,
    paymentMethod: String,
    lastBillingDate: Date,
    nextBillingDate: Date
  },
  usage: {
    reservations: {
      type: Number,
      default: 0
    },
    blogPosts: {
      type: Number,
      default: 0
    },
    coupons: {
      type: Number,
      default: 0
    },
    translations: {
      type: Number,
      default: 0
    },
    storage: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
subscriptionPlanSchema.index({ hospital: 1, status: 1 });
subscriptionPlanSchema.index({ endDate: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

export { Subscription, SubscriptionPlan }; 