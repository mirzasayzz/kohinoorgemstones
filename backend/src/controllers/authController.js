import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendTokenResponse } from '../middleware/auth.js';
import User from '../models/User.js';

// @desc    Login admin user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Check for user (include password for comparison)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Account is deactivated', 401);
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  // Update last login
  await user.updateLastLogin();

  // Send token response
  sendTokenResponse(user, 200, res, 'Login successful');
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Please provide current password and new password', 400);
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Set new password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Create new admin user (Super Admin only)
// @route   POST /api/auth/create-admin
// @access  Private (Super Admin)
export const createAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, password, role = 'admin' } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  res.status(201).json({
    success: true,
    message: 'Admin user created successfully',
    data: {
      user
    }
  });
});

// @desc    Get all admin users (Super Admin only)
// @route   GET /api/auth/admins
// @access  Private (Super Admin)
export const getAdmins = asyncHandler(async (req, res, next) => {
  const users = await User.find({ role: { $in: ['admin', 'super_admin'] } })
    .select('-password')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    data: {
      users
    }
  });
});

// @desc    Update admin user status (Super Admin only)
// @route   PUT /api/auth/admin/:id/status
// @access  Private (Super Admin)
export const updateAdminStatus = asyncHandler(async (req, res, next) => {
  const { isActive } = req.body;

  if (req.params.id === req.user.id.toString()) {
    throw new AppError('You cannot deactivate your own account', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: {
      user
    }
  });
});

// @desc    Delete admin user (Super Admin only)
// @route   DELETE /api/auth/admin/:id
// @access  Private (Super Admin)
export const deleteAdmin = asyncHandler(async (req, res, next) => {
  if (req.params.id === req.user.id.toString()) {
    throw new AppError('You cannot delete your own account', 400);
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
}); 