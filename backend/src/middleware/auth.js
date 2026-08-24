import jwt from 'jsonwebtoken';
import { asyncHandler, AppError } from './errorHandler.js';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        throw new AppError('User no longer exists', 401);
      }

      if (!req.user.isActive) {
        throw new AppError('User account is deactivated', 401);
      }

      next();
    } catch (error) {
      throw new AppError('Not authorized, token failed', 401);
    }
  }

  if (!token) {
    throw new AppError('Not authorized, no token', 401);
  }
});

// Admin only access
export const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
    next();
  } else {
    throw new AppError('Admin access required', 403);
  }
});

// Super admin only access
export const superAdminOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    throw new AppError('Super admin access required', 403);
  }
});

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// Create and send token response
export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  // Create token
  const token = generateToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_EXPIRES_IN) || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          profileImage: user.profileImage
        }
      }
    });
};

// Optional auth - doesn't throw error if no token
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Continue without user if token is invalid
      req.user = null;
    }
  }

  next();
}); 