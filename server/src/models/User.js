import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto-js';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['patient', 'hospital_admin', 'ai_journalist', 'platform_admin'],
    default: 'patient',
  },
  phone: {
    type: String,
    required: true
  },
  // Encrypted personal data
  personalData: {
    type: String, // Encrypted JSON string
    required: false
  },
  // For hospital administrators
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: function() {
      return this.role === 'hospital_admin';
    },
  },
  // For AI journalist accounts
  aiSettings: {
    type: Object,
    required: function() {
      return this.role === 'ai_journalist';
    }
  },
  // Social media integration
  socialMediaAccounts: [{
    platform: String,
    accountId: String,
    accessToken: String,
    refreshToken: String
  }],
  // Subscription details
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Encrypt personal data before saving
userSchema.pre('save', function(next) {
  if (this.isModified('personalData') && this.personalData) {
    this.personalData = crypto.AES.encrypt(
      this.personalData,
      process.env.ENCRYPTION_KEY
    ).toString();
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Method to decrypt personal data
userSchema.methods.getDecryptedPersonalData = function() {
  if (!this.personalData) return null;
  const bytes = crypto.AES.decrypt(this.personalData, process.env.ENCRYPTION_KEY);
  return JSON.parse(bytes.toString(crypto.enc.Utf8));
};

// Method to generate auth token
userSchema.methods.generateAuthToken = function() {
  const user = this;
  const token = jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  return token;
};

// Method to get public profile
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User; 