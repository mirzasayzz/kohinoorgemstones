import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { body, validationResult } from 'express-validator';
import Customer from '../models/Customer.js';
import { sendVerificationOTP, sendPasswordResetOTP, sendWelcomeEmail } from '../services/emailService.js';

// Configure Cloudinary - log config status on startup
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};

// Validate Cloudinary config
if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
  console.warn('[Cloudinary] Missing config:', {
    cloud_name: !!cloudinaryConfig.cloud_name,
    api_key: !!cloudinaryConfig.api_key,
    api_secret: !!cloudinaryConfig.api_secret
  });
}

cloudinary.config(cloudinaryConfig);

// Configure Multer for avatar upload
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id, type: 'customer' }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Authentication middleware for customers
const authenticateCustomer = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'customer') {
      return res.status(401).json({ success: false, message: 'Invalid token type' });
    }

    const customer = await Customer.findById(decoded.id);
    if (!customer || !customer.isActive) {
      return res.status(401).json({ success: false, message: 'Customer not found or inactive' });
    }

    req.customer = customer;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Validation rules with user-friendly messages
const signupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Please enter your full name')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
    .isLength({ max: 50 }).withMessage('Name is too long (max 50 characters)'),
  body('email')
    .trim()
    .notEmpty().withMessage('Please enter your email address')
    .isEmail().withMessage('Please enter a valid email address (e.g., name@example.com)'),
  body('password')
    .notEmpty().withMessage('Please create a password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('dateOfBirth')
    .optional({ checkFalsy: true }),
  body('phone')
    .optional()
    .trim()
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Please enter your email address')
    .isEmail().withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty().withMessage('Please enter your password')
];

// Handle validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
};

// ============================================
// CHECK EMAIL EXISTS (for frontend validation)
// ============================================
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const existingCustomer = await Customer.findOne({ email });
    res.json({
      success: true,
      exists: !!existingCustomer,
      verified: existingCustomer?.isEmailVerified || false
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// SEND OTP (for pre-signup verification)
// ============================================
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      if (existingCustomer.isEmailVerified) {
        return res.status(400).json({
          success: false,
          exists: true,
          message: 'This email is already registered. Please sign in.'
        });
      } else {
        // User exists but not verified - resend OTP
        const otp = existingCustomer.generateEmailOTP();
        await existingCustomer.save({ validateBeforeSave: false });

        console.log(`📧 OTP for existing unverified ${email}: ${otp}`);

        // Send email (with 10s timeout built into emailService)
        await sendVerificationOTP(email, existingCustomer.name || 'User', otp);

        return res.json({ success: true, message: 'OTP sent successfully' });
      }
    }

    // Generate OTP for new user - store temporarily
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 30 * 60 * 1000; // 30 minutes (extended)

    // Store OTP temporarily
    if (!global.pendingOTPs) global.pendingOTPs = {};
    global.pendingOTPs[email] = { otp, expire: otpExpire };

    console.log(`📧 OTP for ${email}: ${otp}`); // For debugging/development

    // Send email (with 10s timeout built into emailService)
    await sendVerificationOTP(email, 'User', otp);

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});

// ============================================
// VERIFY OTP (check OTP before final signup)
// ============================================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const pendingOTP = global.pendingOTPs?.[email];

    if (!pendingOTP) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    if (pendingOTP.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again.' });
    }

    if (Date.now() > pendingOTP.expire) {
      delete global.pendingOTPs[email];
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    // Mark OTP as verified but don't delete yet (will be deleted on final signup)
    global.pendingOTPs[email].verified = true;

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// ============================================
// SIGNUP
// ============================================
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, dateOfBirth, phone, address, place, otp, checkOnly } = req.body;

    // If checkOnly is true, just check if email exists
    if (checkOnly) {
      const existingEmail = await Customer.findOne({ email });
      return res.json({
        success: true,
        exists: !!existingEmail,
        message: existingEmail ? 'Email already registered' : 'Email available'
      });
    }

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    // Check if email exists
    const existingEmail = await Customer.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'This email is already registered. Please sign in or use a different email.' });
    }

    // Check age (must be at least 13) - only if DOB provided
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 13) {
        return res.status(400).json({ success: false, message: 'You must be at least 13 years old to create an account.' });
      }
    }

    // Verify OTP was checked before signup
    const pendingOTP = global.pendingOTPs?.[email];
    if (!pendingOTP || !pendingOTP.verified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email with OTP first'
      });
    }

    // Create customer with verified email
    const customer = await Customer.create({
      name,
      email,
      password,
      dateOfBirth,
      phone,
      address: place ? { city: place } : (address || {}),
      isEmailVerified: true // Email verified via OTP
    });

    // Clean up pending OTP
    delete global.pendingOTPs[email];

    // Send welcome email (with 10s timeout)
    await sendWelcomeEmail(email, name);

    // Generate token and return
    const token = generateToken(customer._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: customer.toJSON()
    });

  } catch (error) {
    console.error('Signup error:', error);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Check which field caused the duplicate error
      const field = Object.keys(error.keyPattern || {})[0];
      if (field === 'email') {
        return res.status(400).json({ success: false, message: 'This email is already registered.' });
      }
      return res.status(400).json({ success: false, message: 'Account creation failed. Please try again.' });
    }

    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }

    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
});

// ============================================
// VERIFY EMAIL OTP
// ============================================
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please enter the verification code sent to your email.' });
    }

    const customer = await Customer.findOne({ email }).select('+emailVerificationOTP +emailVerificationExpire');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Account not found. Please sign up again.' });
    }

    if (customer.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Your email is already verified. You can sign in.' });
    }

    if (!customer.verifyEmailOTP(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code. Please request a new one.' });
    }

    // Verify email
    customer.isEmailVerified = true;
    customer.emailVerificationOTP = undefined;
    customer.emailVerificationExpire = undefined;
    await customer.save({ validateBeforeSave: false });

    // Send welcome email (with 10s timeout)
    await sendWelcomeEmail(email, customer.name);

    // Generate token
    const token = generateToken(customer._id);

    res.json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: customer.toJSON()
    });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
});

// ============================================
// RESEND OTP
// ============================================
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (customer.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    // Generate new OTP
    const otp = customer.generateEmailOTP();
    await customer.save({ validateBeforeSave: false });

    await sendVerificationOTP(email, customer.name, otp);

    res.json({
      success: true,
      message: 'New verification code sent to your email'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to resend OTP. Please try again.' });
  }
});

// ============================================
// LOGIN
// ============================================
router.post('/login', loginValidation, handleValidation, async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email }).select('+password');

    if (!customer) {
      return res.status(401).json({ success: false, message: 'No account found with this email. Please check your email or create a new account.' });
    }

    if (!customer.isActive) {
      return res.status(401).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    const isPasswordMatch = await customer.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    if (!customer.isEmailVerified) {
      // Send new OTP
      const otp = customer.generateEmailOTP();
      await customer.save({ validateBeforeSave: false });
      await sendVerificationOTP(email, customer.name, otp);

      return res.status(403).json({
        success: false,
        message: 'Please verify your email first. A new code has been sent.',
        requiresVerification: true,
        email: customer.email
      });
    }

    // Update last login
    await customer.updateLastLogin();

    // Generate token
    const token = generateToken(customer._id);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: customer.toJSON()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

// ============================================
// FORGOT PASSWORD
// ============================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const customer = await Customer.findOne({ email });

    if (!customer) {
      // Don't reveal if email exists
      return res.json({ success: true, message: 'If an account exists, a reset code will be sent.' });
    }

    // Generate reset OTP
    const otp = customer.generatePasswordResetOTP();
    await customer.save({ validateBeforeSave: false });

    await sendPasswordResetOTP(email, customer.name, otp);

    res.json({
      success: true,
      message: 'Password reset code sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to process request. Please try again.' });
  }
});

// ============================================
// RESET PASSWORD
// ============================================
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const customer = await Customer.findOne({ email }).select('+resetPasswordOTP +resetPasswordExpire');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (!customer.verifyPasswordResetOTP(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
    }

    // Update password
    customer.password = newPassword;
    customer.resetPasswordOTP = undefined;
    customer.resetPasswordExpire = undefined;
    await customer.save();

    res.json({
      success: true,
      message: 'Password reset successful! Please login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Password reset failed. Please try again.' });
  }
});

// ============================================
// GET CURRENT USER (Protected)
// ============================================
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'customer') {
      return res.status(401).json({ success: false, message: 'Invalid token type' });
    }

    const customer = await Customer.findById(decoded.id);

    if (!customer || !customer.isActive) {
      return res.status(401).json({ success: false, message: 'Account not found or inactive' });
    }

    res.json({
      success: true,
      user: customer.toJSON()
    });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});

// ============================================
// UPDATE PROFILE (Protected)
// ============================================
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const { name, phone, avatar, preferences, dateOfBirth, address } = req.body;

    if (name) customer.name = name;
    if (phone) customer.phone = phone;
    if (avatar) customer.avatar = avatar;
    if (dateOfBirth) customer.dateOfBirth = new Date(dateOfBirth);
    if (address) {
      customer.address = { ...customer.address, ...address };
    }
    if (preferences) customer.preferences = { ...customer.preferences, ...preferences };

    await customer.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: customer.toJSON()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// ============================================
// UPLOAD AVATAR (Protected)
// ============================================
router.post('/avatar', avatarUpload.single('image'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image' });
    }

    // Verify Cloudinary config before upload
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('[Avatar] Cloudinary config missing');
      return res.status(500).json({
        success: false,
        message: 'Image upload service not configured. Please contact admin.'
      });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Use consistent public_id per user - overwrites old avatar automatically
    const publicId = `kohinoor-avatars/user_${customer._id}`;

    // Delete old avatar if exists (cleanup)
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (e) {
      // Ignore if doesn't exist
    }

    // Upload to Cloudinary with low quality, small size, overwrite enabled
    const result = await cloudinary.uploader.upload(dataURI, {
      public_id: publicId,
      overwrite: true,
      transformation: [
        { width: 150, height: 150, crop: 'fill', gravity: 'face' },
        { quality: 60 },
        { fetch_format: 'webp' }
      ]
    });

    // Update customer avatar with cache-busting timestamp
    customer.avatar = `${result.secure_url}?v=${Date.now()}`;
    await customer.save();

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      url: result.secure_url,
      user: customer.toJSON()
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    // Don't expose internal error details to client
    res.status(500).json({
      success: false,
      message: 'Server is busy. Please try again later.'
    });
  }
});

// ============================================
// CHECK USERNAME AVAILABILITY
// ============================================
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const exists = await Customer.findOne({ username: username.toLowerCase() });
    res.json({ available: !exists });
  } catch (error) {
    res.status(500).json({ available: false });
  }
});

// ============================================
// CHECK EMAIL AVAILABILITY
// ============================================
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const exists = await Customer.findOne({ email: email.toLowerCase() });
    res.json({ available: !exists });
  } catch (error) {
    res.status(500).json({ available: false });
  }
});

// ============================================
// CHAT - Customer Routes
// ============================================
import Message from '../models/Message.js';

// Get customer's chat messages
router.get('/chat/messages', authenticateCustomer, async (req, res) => {
  try {
    const messages = await Message.find({ customer: req.customer._id })
      .sort({ createdAt: 1 })
      .limit(100);
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to load messages' });
  }
});

// Send message to admin
router.post('/chat/send', authenticateCustomer, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ success: false, message: 'Message too long (max 1000 chars)' });
    }

    const newMessage = await Message.create({
      customer: req.customer._id,
      content: message.trim(),
      sender: 'customer'
    });

    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// Get unread count
router.get('/chat/unread', authenticateCustomer, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      customer: req.customer._id,
      sender: 'admin',
      isRead: false
    });
    res.json({ success: true, unreadCount: count });
  } catch (error) {
    res.status(500).json({ success: false, unreadCount: 0 });
  }
});

// Mark messages as read
router.post('/chat/read', authenticateCustomer, async (req, res) => {
  try {
    await Message.updateMany(
      { customer: req.customer._id, sender: 'admin', isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;
