import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxLength: [50, 'Name cannot exceed 50 characters']
  },
  username: {
    type: String,
    trim: true,
    lowercase: true,
    maxLength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  dateOfBirth: {
    type: Date
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    country: { type: String, default: 'India' }
  },
  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationOTP: {
    type: String,
    select: false
  },
  emailVerificationExpire: {
    type: Date,
    select: false
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  // Password reset
  resetPasswordOTP: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  },
  // Wishlist reference
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gemstone'
  }],
  // Preferences
  preferences: {
    newsletter: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Index for faster lookups
customerSchema.index({ email: 1 });
customerSchema.index({ username: 1 });

// Hash password before saving
customerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
customerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
customerSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
};

// Generate email verification OTP using crypto for true randomness
customerSchema.methods.generateEmailOTP = function() {
  // Generate cryptographically secure random 6-digit OTP
  const randomBytes = crypto.randomBytes(3);
  const randomNum = randomBytes.readUIntBE(0, 3); // 0-16777215
  const otp = String(100000 + (randomNum % 900000)); // 100000-999999
  
  this.emailVerificationOTP = crypto.createHash('sha256').update(otp).digest('hex');
  this.emailVerificationExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

// Verify email OTP
customerSchema.methods.verifyEmailOTP = function(otp) {
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
  return this.emailVerificationOTP === hashedOTP && this.emailVerificationExpire > Date.now();
};

// Generate password reset OTP using crypto for true randomness
customerSchema.methods.generatePasswordResetOTP = function() {
  // Generate cryptographically secure random 6-digit OTP
  const randomBytes = crypto.randomBytes(3);
  const randomNum = randomBytes.readUIntBE(0, 3);
  const otp = String(100000 + (randomNum % 900000));
  
  this.resetPasswordOTP = crypto.createHash('sha256').update(otp).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

// Verify password reset OTP
customerSchema.methods.verifyPasswordResetOTP = function(otp) {
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
  return this.resetPasswordOTP === hashedOTP && this.resetPasswordExpire > Date.now();
};

// Get age from DOB
customerSchema.methods.getAge = function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Hide sensitive info
customerSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationOTP;
  delete obj.emailVerificationExpire;
  delete obj.resetPasswordOTP;
  delete obj.resetPasswordExpire;
  return obj;
};

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
