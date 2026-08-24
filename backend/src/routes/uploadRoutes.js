import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  }
});

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private (Admin)
const uploadSingleImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    throw new AppError('Please select an image to upload', 400);
  }

  // Convert buffer to base64
  const b64 = Buffer.from(req.file.buffer).toString('base64');
  const dataURI = `data:${req.file.mimetype};base64,${b64}`;

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'kohinoor-gemstones',
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  });

  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    }
  });
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private (Admin)
const uploadMultipleImages = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError('Please select images to upload', 400);
  }

  const uploadPromises = req.files.map(async (file) => {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'kohinoor-gemstones',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      originalName: file.originalname
    };
  });

  const uploadResults = await Promise.all(uploadPromises);

  res.status(200).json({
    success: true,
    message: `${uploadResults.length} images uploaded successfully`,
    data: {
      images: uploadResults
    }
  });
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/image/:publicId
// @access  Private (Admin)
const deleteImage = asyncHandler(async (req, res, next) => {
  const { publicId } = req.params;

  if (!publicId) {
    throw new AppError('Public ID is required', 400);
  }

  // Delete from Cloudinary
  const result = await cloudinary.uploader.destroy(publicId);

  if (result.result !== 'ok') {
    throw new AppError('Failed to delete image', 500);
  }

  res.status(200).json({
    success: true,
    message: 'Image deleted successfully'
  });
});

// @desc    Upload base64 image (from frontend)
// @route   POST /api/upload/base64
// @access  Private (Admin)
const uploadBase64Image = asyncHandler(async (req, res, next) => {
  const { image, folder = 'kohinoor-gemstones' } = req.body;

  if (!image) {
    throw new AppError('Base64 image data is required', 400);
  }

  if (!image.startsWith('data:image/')) {
    throw new AppError('Invalid image format', 400);
  }

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(image, {
    folder,
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  });

  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    }
  });
});

// @desc    Get image transformations
// @route   GET /api/upload/transformations/:publicId
// @access  Private (Admin)
const getImageTransformations = asyncHandler(async (req, res, next) => {
  const { publicId } = req.params;
  const { width, height, quality = 'auto', format = 'auto' } = req.query;

  if (!publicId) {
    throw new AppError('Public ID is required', 400);
  }

  // Generate transformation URLs
  const transformations = [];

  // Thumbnail
  transformations.push({
    name: 'thumbnail',
    url: cloudinary.url(publicId, {
      width: 150,
      height: 150,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    })
  });

  // Small
  transformations.push({
    name: 'small',
    url: cloudinary.url(publicId, {
      width: 300,
      height: 300,
      crop: 'fit',
      quality: 'auto',
      fetch_format: 'auto'
    })
  });

  // Medium
  transformations.push({
    name: 'medium',
    url: cloudinary.url(publicId, {
      width: 600,
      height: 600,
      crop: 'fit',
      quality: 'auto',
      fetch_format: 'auto'
    })
  });

  // Large
  transformations.push({
    name: 'large',
    url: cloudinary.url(publicId, {
      width: 1200,
      height: 1200,
      crop: 'fit',
      quality: 'auto',
      fetch_format: 'auto'
    })
  });

  // Custom transformation if dimensions provided
  if (width || height) {
    transformations.push({
      name: 'custom',
      url: cloudinary.url(publicId, {
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        crop: 'fit',
        quality,
        fetch_format: format
      })
    });
  }

  res.status(200).json({
    success: true,
    data: {
      publicId,
      transformations
    }
  });
});

// Apply authentication middleware to all routes
router.use(protect);
router.use(adminOnly);

// Routes
router.post('/image', upload.single('image'), uploadSingleImage);
router.post('/images', upload.array('images', 10), uploadMultipleImages);
router.post('/base64', uploadBase64Image);
router.delete('/image/:publicId', deleteImage);
router.get('/transformations/:publicId', getImageTransformations);

export default router; 