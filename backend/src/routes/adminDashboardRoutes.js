import express from 'express';
import {
  showLogin,
  handleLogin,
  handleLogout,
  showForgotPassword,
  handleForgotPassword,
  showResetPassword,
  handleResetPassword,
  showChangePassword,
  handleChangePassword,
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
  showCategories,
  addCategory,
  deleteCategory,
  toggleCategoryStatus,
  requireAuth
} from '../controllers/adminDashboardController.js';
import multer from 'multer';

const router = express.Router();

// Middleware to prevent caching for admin pages
const noCacheMiddleware = (req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Last-Modified': new Date().toUTCString()
  });
  next();
};

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
router.get('/admin/forgot-password', showForgotPassword);
router.post('/admin/forgot-password', handleForgotPassword);
router.get('/admin/reset-password/:token', showResetPassword);
router.post('/admin/reset-password/:token', handleResetPassword);

// Protected routes (require authentication) - with no-cache middleware
router.get('/admin/logout', requireAuth, handleLogout);
router.get('/admin/change-password', requireAuth, noCacheMiddleware, showChangePassword);
router.post('/admin/change-password', requireAuth, handleChangePassword);
router.get('/admin', requireAuth, noCacheMiddleware, showDashboard);
router.get('/admin/dashboard', requireAuth, noCacheMiddleware, showDashboard);

// Gemstone management routes - with no-cache middleware
router.get('/admin/gemstones', requireAuth, noCacheMiddleware, showGemstones);
router.get('/admin/gemstones/add', requireAuth, noCacheMiddleware, showAddGemstone);
router.post('/admin/gemstones/add', requireAuth, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'certificationImage', maxCount: 1 }
]), handleAddGemstone);
router.get('/admin/gemstones/edit/:id', requireAuth, noCacheMiddleware, showEditGemstone);
router.post('/admin/gemstones/edit/:id', requireAuth, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'certificationImage', maxCount: 1 }
]), handleEditGemstone);

// REST API endpoints for AJAX calls
router.delete('/admin/gemstones/:id', requireAuth, handleDeleteGemstone);
router.put('/admin/gemstones/:id/toggle-trending', requireAuth, handleToggleTrending);

// Legacy POST routes for backwards compatibility
router.post('/admin/gemstones/delete/:id', requireAuth, handleDeleteGemstone);
router.post('/admin/gemstones/toggle-trending/:id', requireAuth, handleToggleTrending);

// Business info management routes - with no-cache middleware for critical data
router.get('/admin/business', requireAuth, noCacheMiddleware, showBusinessInfo);
router.post('/admin/business', requireAuth, noCacheMiddleware, upload.single('certificationImage'), handleUpdateBusinessInfo);

// Unified Admin API for Business (session-based auth)
router.put('/admin/api/business', requireAuth, handleUpdateBusinessInfo);

// Bulk operations
router.post('/admin/gemstones/bulk', requireAuth, handleBulkOperations);

// Analytics
router.get('/admin/api/analytics', requireAuth, getDashboardAnalytics);

// Category Management Routes
router.get('/admin/categories', requireAuth, noCacheMiddleware, showCategories);
router.post('/admin/categories/add', requireAuth, addCategory);
router.delete('/admin/categories/delete/:id', requireAuth, deleteCategory);
router.put('/admin/categories/toggle/:id', requireAuth, toggleCategoryStatus);

// Users Management Routes
import Customer from '../models/Customer.js';
import Message from '../models/Message.js';

router.get('/admin/users', requireAuth, noCacheMiddleware, async (req, res) => {
  try {
    const users = await Customer.find().sort({ createdAt: -1 });
    const unreadChats = await Message.getUnreadCountForAdmin();
    res.render('admin/users', {
      title: 'Users - Kohinoor Admin',
      user: req.session.user,
      users,
      unreadChats
    });
  } catch (error) {
    console.error('Users page error:', error);
    res.render('admin/error', { title: 'Error', error: 'Failed to load users' });
  }
});

// Delete User - removes user and all their data
router.delete('/admin/users/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Delete user's messages
    await Message.deleteMany({ customer: userId });

    // Delete the user
    const deletedUser = await Customer.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`[Admin] Deleted user: ${deletedUser.email}`);

    res.json({
      success: true,
      message: `User ${deletedUser.name} and all their data have been deleted`
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

// Chat Routes
router.get('/admin/chats', requireAuth, noCacheMiddleware, async (req, res) => {
  try {
    const conversations = await Message.getAllConversations();
    const totalUnread = await Message.getUnreadCountForAdmin();
    res.render('admin/chats', {
      title: 'Chats - Kohinoor Admin',
      user: req.session.user,
      conversations,
      totalUnread,
      activeChat: null,
      activeCustomer: null,
      messages: []
    });
  } catch (error) {
    console.error('Chats page error:', error);
    res.render('admin/error', { title: 'Error', error: 'Failed to load chats' });
  }
});

router.get('/admin/chats/:customerId', requireAuth, noCacheMiddleware, async (req, res) => {
  try {
    const conversations = await Message.getAllConversations();
    const totalUnread = await Message.getUnreadCountForAdmin();
    const activeCustomer = await Customer.findById(req.params.customerId);
    const messages = await Message.getConversation(req.params.customerId);

    // Mark messages as read
    await Message.updateMany(
      { customer: req.params.customerId, sender: 'customer', isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.render('admin/chats', {
      title: 'Chats - Kohinoor Admin',
      user: req.session.user,
      conversations,
      totalUnread,
      activeChat: req.params.customerId,
      activeCustomer,
      messages
    });
  } catch (error) {
    console.error('Chat detail error:', error);
    res.render('admin/error', { title: 'Error', error: 'Failed to load chat' });
  }
});

router.post('/admin/chats/:customerId/reply', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    await Message.create({
      customer: req.params.customerId,
      content: message,
      sender: 'admin',
      adminUser: req.session.user.id
    });
    res.redirect('/admin/chats/' + req.params.customerId);
  } catch (error) {
    console.error('Reply error:', error);
    res.redirect('/admin/chats/' + req.params.customerId);
  }
});

// ============================================
// ADMIN MANAGEMENT (Super Admin Only)
// ============================================
import User from '../models/User.js';

// Middleware to check super admin
const requireSuperAdmin = (req, res, next) => {
  if (req.session.user?.role !== 'super_admin') {
    return res.status(403).render('admin/error', {
      title: 'Access Denied',
      error: 'Only Super Admin can access this page'
    });
  }
  next();
};

// List all admins
router.get('/admin/admins', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const admins = await User.find().sort({ role: -1, createdAt: -1 });
    res.render('admin/admins', {
      title: 'Manage Admins - Kohinoor',
      user: req.session.user,
      admins,
      error: req.query.error,
      success: req.query.success
    });
  } catch (error) {
    console.error('Admins page error:', error);
    res.render('admin/error', { title: 'Error', error: 'Failed to load admins' });
  }
});

// Add new admin
router.post('/admin/admins/add', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.redirect('/admin/admins?error=' + encodeURIComponent('Email already exists'));
    }

    // Create new admin
    await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'admin',
      isActive: true
    });

    res.redirect('/admin/admins?success=' + encodeURIComponent('Admin created successfully!'));
  } catch (error) {
    console.error('Add admin error:', error);
    res.redirect('/admin/admins?error=' + encodeURIComponent('Failed to create admin: ' + error.message));
  }
});

// Toggle admin status
router.get('/admin/admins/toggle/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);

    if (!admin) {
      return res.redirect('/admin/admins?error=' + encodeURIComponent('Admin not found'));
    }

    // Prevent toggling super_admin or self
    if (admin.role === 'super_admin' || admin._id.toString() === req.session.user.id) {
      return res.redirect('/admin/admins?error=' + encodeURIComponent('Cannot modify this admin'));
    }

    admin.isActive = !admin.isActive;
    await admin.save();

    res.redirect('/admin/admins?success=' + encodeURIComponent(`Admin ${admin.isActive ? 'activated' : 'deactivated'} successfully`));
  } catch (error) {
    console.error('Toggle admin error:', error);
    res.redirect('/admin/admins?error=' + encodeURIComponent('Failed to update admin'));
  }
});

// Delete admin
router.post('/admin/admins/delete/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);

    if (!admin) {
      return res.redirect('/admin/admins?error=' + encodeURIComponent('Admin not found'));
    }

    // Prevent deleting super_admin or self
    if (admin.role === 'super_admin' || admin._id.toString() === req.session.user.id) {
      return res.redirect('/admin/admins?error=' + encodeURIComponent('Cannot delete this admin'));
    }

    await User.findByIdAndDelete(req.params.id);

    res.redirect('/admin/admins?success=' + encodeURIComponent('Admin deleted successfully'));
  } catch (error) {
    console.error('Delete admin error:', error);
    res.redirect('/admin/admins?error=' + encodeURIComponent('Failed to delete admin'));
  }
});

// ============================================
// KOHINOOR AI SETTINGS - DATABASE PERSISTENT
// ============================================
import { GoogleGenerativeAI } from '@google/generative-ai';
import Settings from '../models/Settings.js';

// Cache for API key (loaded from DB on startup)
let cachedApiKey = null;
let cacheLoaded = false;

// Load API key from database
const loadApiKeyFromDB = async () => {
  try {
    const apiKey = await Settings.get('ai_api_key');
    cachedApiKey = apiKey;
    cacheLoaded = true;
    if (apiKey) {
      console.log('[AI] API key loaded from database');
    }
    return apiKey;
  } catch (error) {
    console.error('[AI] Error loading API key from DB:', error);
    return null;
  }
};

// Get the active API key (from DB cache or env)
export const getActiveApiKey = async () => {
  // Load from DB if not cached
  if (!cacheLoaded) {
    await loadApiKeyFromDB();
  }

  if (cachedApiKey) {
    return cachedApiKey;
  }
  return process.env.GEMINI_API_KEY;
};

// Sync version for backwards compatibility
export const getActiveApiKeySync = () => {
  if (cachedApiKey) {
    return cachedApiKey;
  }
  return process.env.GEMINI_API_KEY;
};

// Initialize: Load API key on startup
loadApiKeyFromDB();

// AI Settings Page
router.get('/admin/ai-settings', requireAuth, noCacheMiddleware, async (req, res) => {
  try {
    const unreadChats = await Message.getUnreadCountForAdmin();
    const apiKey = await Settings.get('ai_api_key');
    const lastUpdated = await Settings.get('ai_api_key_updated');

    res.render('admin/ai-settings', {
      title: 'AI Settings - Kohinoor Admin',
      user: req.session.user,
      aiConfig: {
        useCustomKey: !!apiKey,
        apiKey: apiKey ? '••••••••' : null,
        lastUpdated: lastUpdated
      },
      unreadChats
    });
  } catch (error) {
    console.error('AI Settings page error:', error);
    res.render('admin/error', { title: 'Error', error: 'Failed to load AI settings' });
  }
});

// Save API Key to Database
router.post('/admin/ai-settings/api-key', requireAuth, async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (apiKey && apiKey.trim()) {
      // Save to database
      await Settings.set('ai_api_key', apiKey.trim());
      await Settings.set('ai_api_key_updated', new Date());

      // Update cache
      cachedApiKey = apiKey.trim();

      console.log('[Admin] AI API key saved to database');
    } else {
      // Clear from database
      await Settings.remove('ai_api_key');
      await Settings.remove('ai_api_key_updated');

      // Clear cache
      cachedApiKey = null;

      console.log('[Admin] AI API key cleared, using environment variable');
    }

    res.json({ success: true, message: 'API key saved successfully' });
  } catch (error) {
    console.error('Save API key error:', error);
    res.status(500).json({ success: false, message: 'Failed to save API key' });
  }
});

// Detect provider from API key
const detectProvider = (apiKey) => {
  if (!apiKey) return null;
  if (apiKey.startsWith('sk-mega-')) return 'megallm';
  if (apiKey.startsWith('sk-')) return 'openai';
  return 'gemini';
};

// Test API Key (supports Gemini, MegaLLM, OpenAI)
router.post('/admin/ai-settings/test-key', requireAuth, async (req, res) => {
  try {
    const { apiKey } = req.body;
    const keyToTest = apiKey || getActiveApiKey();

    if (!keyToTest) {
      return res.status(400).json({ success: false, message: 'No API key provided' });
    }

    const provider = detectProvider(keyToTest);
    let response;

    if (provider === 'megallm' || provider === 'openai') {
      // Test with OpenAI SDK (MegaLLM or OpenAI)
      const OpenAI = (await import('openai')).default;
      const client = new OpenAI({
        baseURL: provider === 'megallm' ? 'https://ai.megallm.io/v1' : undefined,
        apiKey: keyToTest
      });

      const result = await client.chat.completions.create({
        model: provider === 'megallm' ? 'openai-gpt-oss-20b' : 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say hi' }],
        max_tokens: 50
      });
      response = result.choices[0].message.content;
    } else {
      // Test with Gemini
      const genAI = new GoogleGenerativeAI(keyToTest);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent("Say hi");
      response = result.response.text();
    }

    if (response) {
      const providerNames = { megallm: 'MegaLLM', openai: 'OpenAI', gemini: 'Gemini' };
      res.json({
        success: true,
        message: `${providerNames[provider]} API key is valid!`,
        provider: provider,
        response: response.substring(0, 100)
      });
    } else {
      res.json({ success: false, message: 'API key test failed - no response' });
    }
  } catch (error) {
    console.error('Test API key error:', error);
    res.status(400).json({ success: false, message: error.message || 'Invalid API key' });
  }
});

export default router; 