import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  specialties: [{
    type: String
  }],
  doctors: [{
    name: String,
    specialty: String,
    bio: String,
    image: String
  }],
  images: [{
    url: String,
    caption: String
  }],
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    youtube: String
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  settings: {
    blogAutoPublish: {
      type: Boolean,
      default: false
    },
    socialMediaAutoShare: {
      type: Boolean,
      default: false
    },
    translationEnabled: {
      type: Boolean,
      default: false
    }
  },
  stats: {
    totalReservations: {
      type: Number,
      default: 0
    },
    totalBlogPosts: {
      type: Number,
      default: 0
    },
    totalCoupons: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for location-based queries
hospitalSchema.index({ 'address.coordinates': '2dsphere' });

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital; 