import express from 'express';
import {
  showLogin,
  handleLogin,
  handleLogout,
  showDashboard,
  showGemstones,
  showAddGemstone,
  handleAddGemstone,
  showEditGemstone,
  handleEditGemstone,
  handleDeleteGemstone,
  handleToggleTrending,
  showBusinessInfo,
  handleUpdateBusinessInfo,
  handleBulkOperations,
  getDashboardAnalytics,
  requireAuth
} from '../controllers/adminDashboardController.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
router.get('/admin/login', showLogin);
router.post('/admin/login', handleLogin);

// Protected routes (require authentication)
router.get('/admin/logout', requireAuth, handleLogout);
router.get('/', requireAuth, showDashboard);
router.get('/admin', requireAuth, showDashboard);
router.get('/admin/dashboard', requireAuth, showDashboard);

// Gemstone management routes
router.get('/admin/gemstones', requireAuth, showGemstones);
router.get('/admin/gemstones/add', requireAuth, showAddGemstone);
router.post('/admin/gemstones/add', requireAuth, upload.array('images', 10), handleAddGemstone);
router.get('/admin/gemstones/edit/:id', requireAuth, showEditGemstone);
router.post('/admin/gemstones/edit/:id', requireAuth, upload.array('images', 10), handleEditGemstone);

// REST API endpoints for AJAX calls
router.delete('/admin/gemstones/:id', requireAuth, handleDeleteGemstone);
router.put('/admin/gemstones/:id/toggle-trending', requireAuth, handleToggleTrending);

// Legacy POST routes for backwards compatibility
router.post('/admin/gemstones/delete/:id', requireAuth, handleDeleteGemstone);
router.post('/admin/gemstones/toggle-trending/:id', requireAuth, handleToggleTrending);

// Business info management routes
router.get('/admin/business', requireAuth, showBusinessInfo);
router.post('/admin/business', requireAuth, handleUpdateBusinessInfo);

// Bulk operations
router.post('/admin/gemstones/bulk', requireAuth, handleBulkOperations);

// Analytics
router.get('/admin/api/analytics', requireAuth, getDashboardAnalytics);

export default router; 