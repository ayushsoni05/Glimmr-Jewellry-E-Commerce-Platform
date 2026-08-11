const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: false,
    },
    verificationTokenExpiry: {
      type: Date,
      required: false,
    },
    otp: { type: String },
    otpExpiry: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    otpLockedUntil: { type: Date },
    lastOtpSentAt: { type: Date },
    defaultShippingAddressId: { type: mongoose.Schema.Types.ObjectId, ref: 'User.addresses' },
    defaultBillingAddressId: { type: mongoose.Schema.Types.ObjectId, ref: 'User.addresses' },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    adminKey: {
      type: String,
      required: false, // Only required for admin users
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    lastIp: {
      type: String,
      default: null,
    },
    deviceInfo: {
      type: String,
      default: null,
    },
    signupIp: {
      type: String,
      default: null,
    },
    signupDeviceInfo: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: null,
    },
    dob: {
      type: Date,
      default: null,
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    addresses: [addressSchema],
    twoFACode: {
      type: String,
      default: null,
    },
    twoFACodeExpiry: {
      type: Date,
      default: null,
    },
    customUserId: {
      type: String,
      unique: true,
      sparse: true,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    loginHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        ip: { type: String },
        deviceInfo: { type: String },
        status: { type: String, enum: ['success', 'failed_attempt', 'locked'] },
      }
    ],
  },
  { timestamps: true }
);

// Pre-save hook: Auto-generate customUserId if missing
userSchema.pre('save', function (next) {
  if (!this.customUserId) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    this.customUserId = `GLM-${randomNum}`;
  }
  next();
});

userSchema.index({ email: 1 }, { sparse: true });
// Phone index removed - handle uniqueness in application logic to avoid E11000 errors
// userSchema.index({ phone: 1 }, { sparse: true });

module.exports = mongoose.model('User', userSchema);
