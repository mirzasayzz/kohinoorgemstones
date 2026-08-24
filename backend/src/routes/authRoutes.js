import express from 'express';
import {
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  createAdmin,
  getAdmins,
  updateAdminStatus,
  deleteAdmin
} from '../controllers/authController.js';
import { protect, adminOnly, superAdminOnly } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Validation middleware
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const createAdminValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['admin', 'super_admin']).withMessage('Invalid role')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];

// Public routes
router.post('/login', loginValidation, login);

// Protected routes (All authenticated users)
router.use(protect); // All routes after this are protected

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/change-password', changePasswordValidation, changePassword);

// Admin routes
router.use(adminOnly); // All routes after this require admin access

// Super Admin routes
router.post('/create-admin', superAdminOnly, createAdminValidation, createAdmin);
router.get('/admins', superAdminOnly, getAdmins);
router.put('/admin/:id/status', superAdminOnly, updateAdminStatus);
router.delete('/admin/:id', superAdminOnly, deleteAdmin);

export default router; 