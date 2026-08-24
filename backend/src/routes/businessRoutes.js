import express from 'express';
import {
  getBusinessInfo,
  updateBusinessInfo,
  getContactInfo,
  updateContactInfo,
  updateAllContactInfo,
  getCompleteContactInfo,
  updateAddress,
  updateBusinessHours,
  updateSocialMedia,
  addCertification,
  deleteCertification,
  updateHeritage,
  updatePolicies,
  updateSEOSettings,
  updateThemeSettings,
  submitContactForm
} from '../controllers/businessController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { body, param } from 'express-validator';

const router = express.Router();

// Validation middleware
const contactValidation = [
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('whatsapp').optional().isMobilePhone().withMessage('Please provide a valid WhatsApp number')
];

const addressValidation = [
  body('street').optional().notEmpty().withMessage('Street cannot be empty'),
  body('city').optional().notEmpty().withMessage('City cannot be empty'),
  body('state').optional().notEmpty().withMessage('State cannot be empty'),
  body('pincode').optional().isPostalCode('IN').withMessage('Please provide a valid pincode'),
  body('country').optional().notEmpty().withMessage('Country cannot be empty'),
  body('googleMapsUrl').optional().isURL().withMessage('Please provide a valid Google Maps URL')
];

const certificationValidation = [
  body('name').notEmpty().withMessage('Certification name is required'),
  body('validUntil').optional().isISO8601().withMessage('Please provide a valid date')
];

const heritageValidation = [
  body('foundedYear').optional().isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage('Please provide a valid founded year'),
  body('story').optional().isLength({ max: 1000 }).withMessage('Story cannot exceed 1000 characters'),
  body('specialties').optional().isArray().withMessage('Specialties must be an array')
];

const seoValidation = [
  body('metaTitle').optional().isLength({ max: 60 }).withMessage('Meta title cannot exceed 60 characters'),
  body('metaDescription').optional().isLength({ max: 160 }).withMessage('Meta description cannot exceed 160 characters'),
  body('keywords').optional().isArray().withMessage('Keywords must be an array')
];

const themeValidation = [
  body('primaryColor').optional().isHexColor().withMessage('Primary color must be a valid hex color'),
  body('secondaryColor').optional().isHexColor().withMessage('Secondary color must be a valid hex color'),
  body('accentColor').optional().isHexColor().withMessage('Accent color must be a valid hex color')
];

// Public routes
router.get('/info', getBusinessInfo);
router.get('/contact', getContactInfo);
router.get('/contact-complete', getCompleteContactInfo);
router.post('/contact-form', submitContactForm);

// Protected routes - Admin only
router.use(protect);
router.use(adminOnly);

// Business information management
router.put('/info', updateBusinessInfo);
router.put('/contact', contactValidation, updateContactInfo);
router.put('/contact-all', contactValidation.concat(addressValidation), updateAllContactInfo);
router.put('/address', addressValidation, updateAddress);
router.put('/hours', updateBusinessHours);
router.put('/social', updateSocialMedia);

// Certification management
router.post('/certifications', certificationValidation, addCertification);
router.delete('/certifications/:id', param('id').isMongoId().withMessage('Invalid certification ID'), deleteCertification);

// Business details
router.put('/heritage', heritageValidation, updateHeritage);
router.put('/policies', updatePolicies);
router.put('/seo', seoValidation, updateSEOSettings);
router.put('/theme', themeValidation, updateThemeSettings);

export default router; 