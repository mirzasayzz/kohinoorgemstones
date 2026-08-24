import express from 'express';
import {
  getGemstones,
  getGemstone,
  createGemstone,
  updateGemstone,
  deleteGemstone,
  getTrendingGemstones,
  getNewArrivals,
  searchGemstones,
  toggleTrending,
  getGemstoneStats,
  getPredefinedGemstones
} from '../controllers/gemstoneController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';
import { body, param } from 'express-validator';

const router = express.Router();

// Validation middleware
const gemstoneValidation = [
  body('name.english').notEmpty().withMessage('English name is required'),
  body('name.urdu').notEmpty().withMessage('Urdu name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('color').notEmpty().withMessage('Color is required'),
  body('summary').notEmpty().withMessage('Summary is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('purpose').isArray().withMessage('Purpose must be an array'),
  body('images').optional().isArray().withMessage('Images must be an array')
];

const updateGemstoneValidation = [
  body('name.english').optional().notEmpty().withMessage('English name cannot be empty'),
  body('name.urdu').optional().notEmpty().withMessage('Urdu name cannot be empty'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('color').optional().notEmpty().withMessage('Color cannot be empty'),
  body('summary').optional().notEmpty().withMessage('Summary cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('purpose').optional().isArray().withMessage('Purpose must be an array'),
  body('images').optional().isArray().withMessage('Images must be an array')
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid gemstone ID')
];

// Public routes
router.get('/predefined', getPredefinedGemstones);
router.get('/trending', getTrendingGemstones);
router.get('/new-arrivals', getNewArrivals);
router.get('/search/:query', searchGemstones);
router.get('/', optionalAuth, getGemstones);

// Dynamic route for single gemstone (can be ID or slug)
router.get('/:identifier', getGemstone);

// Protected routes - Admin only
router.use(protect);
router.use(adminOnly);

// Admin routes
router.post('/', gemstoneValidation, createGemstone);
router.get('/stats/overview', getGemstoneStats);
router.put('/:id', idValidation, updateGemstoneValidation, updateGemstone);
router.delete('/:id', idValidation, deleteGemstone);
router.put('/:id/trending', idValidation, toggleTrending);

export default router; 