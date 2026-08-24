import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import Gemstone from '../models/Gemstone.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Predefined gemstones with English and Urdu names
export const PREDEFINED_GEMSTONES = [
  { english: 'Diamond', urdu: 'ہیرا (Heera)' },
  { english: 'Emerald', urdu: 'زمرد (Zamurrad)' },
  { english: 'Ruby', urdu: 'یاقوت (Yaqoot)' },
  { english: 'Sapphire', urdu: 'نیلم (Neelam)' },
  { english: 'Topaz', urdu: 'پکھراج (Pukhraj)' },
  { english: 'Coral', urdu: 'مرجان (Marjan)' },
  { english: 'Pearl', urdu: 'موتی (Moti)' },
  { english: 'Turquoise', urdu: 'فیروزہ (Feroza)' },
  { english: 'Onyx', urdu: 'سلیمانی پتھر (Sulemani Pathar)' },
  { english: 'Aqeeq', urdu: 'عقیق (Aqeeq)' },
  { english: 'Moonstone', urdu: 'دُرِ نجف (Dur-e-Najaf)' },
  { english: 'Zircon', urdu: 'زرقون (Zarqun)' },
  { english: 'Opal', urdu: 'اوپل (Opal)' },
  { english: 'Tourmaline', urdu: 'ترمری (Turmari)' },
  { english: 'Garnet', urdu: 'یمن (Yaman) / گرنیٹ (Garnet)' }
];

// @desc    Get predefined gemstone names
// @route   GET /api/gemstones/predefined
// @access  Public
export const getPredefinedGemstones = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {
      gemstones: PREDEFINED_GEMSTONES
    }
  });
});

// @desc    Get all gemstones with filtering, sorting, and pagination
// @route   GET /api/gemstones
// @access  Public
export const getGemstones = asyncHandler(async (req, res, next) => {
  let query = { isActive: true };
  const reqQuery = { ...req.query };

  // Fields to exclude from filtering
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Build query
  if (reqQuery.category) {
    query.category = reqQuery.category;
  }

  if (reqQuery.purpose) {
    query.purpose = { $in: reqQuery.purpose.split(',') };
  }

  if (reqQuery.trending) {
    query.trending = reqQuery.trending === 'true';
  }

  if (reqQuery.featured) {
    query.featured = reqQuery.featured === 'true';
  }

  if (reqQuery.color) {
    query.color = { $regex: reqQuery.color, $options: 'i' };
  }

  if (reqQuery.search) {
    query.$text = { $search: reqQuery.search };
  }

  // Create query
  let mongoQuery = Gemstone.find(query).populate('addedBy', 'name email');

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    mongoQuery = mongoQuery.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    mongoQuery = mongoQuery.sort(sortBy);
  } else {
    mongoQuery = mongoQuery.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Gemstone.countDocuments(query);

  mongoQuery = mongoQuery.skip(startIndex).limit(limit);

  // Execute query
  const gemstones = await mongoQuery;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: gemstones.length,
    total,
    pagination,
    data: {
      gemstones
    }
  });
});

// @desc    Get trending gemstones
// @route   GET /api/gemstones/trending
// @access  Public
export const getTrendingGemstones = asyncHandler(async (req, res, next) => {
  const gemstones = await Gemstone.getTrending();

  res.status(200).json({
    success: true,
    count: gemstones.length,
    data: {
      gemstones
    }
  });
});

// @desc    Get new arrival gemstones
// @route   GET /api/gemstones/new-arrivals
// @access  Public
export const getNewArrivals = asyncHandler(async (req, res, next) => {
  const gemstones = await Gemstone.getNewArrivals();

  res.status(200).json({
    success: true,
    count: gemstones.length,
    data: {
      gemstones
    }
  });
});

// @desc    Get single gemstone by ID or slug
// @route   GET /api/gemstones/:identifier
// @access  Public
export const getGemstone = asyncHandler(async (req, res, next) => {
  const { identifier } = req.params;
  
  // Try to find by MongoDB ID first, then by slug
  let gemstone;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    gemstone = await Gemstone.findById(identifier).populate('addedBy', 'name email');
  } else {
    gemstone = await Gemstone.findOne({ slug: identifier, isActive: true }).populate('addedBy', 'name email');
  }

  if (!gemstone) {
    throw new AppError('Gemstone not found', 404);
  }

  // Increment view count
  await gemstone.incrementViewCount();

  res.status(200).json({
    success: true,
    data: {
      gemstone
    }
  });
});

// @desc    Search gemstones
// @route   GET /api/gemstones/search/:query
// @access  Public
export const searchGemstones = asyncHandler(async (req, res, next) => {
  const { query } = req.params;
  
  if (!query || query.trim().length < 2) {
    throw new AppError('Search query must be at least 2 characters long', 400);
  }

  const gemstones = await Gemstone.searchGemstones(query.trim())
    .populate('addedBy', 'name email')
    .sort({ viewCount: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: gemstones.length,
    data: {
      gemstones
    }
  });
});

// @desc    Create new gemstone
// @route   POST /api/gemstones
// @access  Private (Admin)
export const createGemstone = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.addedBy = req.user.id;

  // Handle image upload if images are provided
  if (req.body.images && Array.isArray(req.body.images)) {
    // Images should be base64 or URLs - process them through Cloudinary
    const processedImages = [];
    
    for (const image of req.body.images) {
      if (image.startsWith('data:image')) {
        // Upload base64 image to Cloudinary
        const result = await cloudinary.uploader.upload(image, {
          folder: 'kohinoor-gemstones',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        });
        
        processedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
          alt: req.body.name?.english || 'Gemstone image'
        });
      }
    }
    
    req.body.images = processedImages;
  }

  const gemstone = await Gemstone.create(req.body);
  const populatedGemstone = await Gemstone.findById(gemstone._id).populate('addedBy', 'name email');

  res.status(201).json({
    success: true,
    message: 'Gemstone created successfully',
    data: {
      gemstone: populatedGemstone
    }
  });
});

// @desc    Update gemstone
// @route   PUT /api/gemstones/:id
// @access  Private (Admin)
export const updateGemstone = asyncHandler(async (req, res, next) => {
  let gemstone = await Gemstone.findById(req.params.id);

  if (!gemstone) {
    throw new AppError('Gemstone not found', 404);
  }

  // Handle new image uploads
  if (req.body.newImages && Array.isArray(req.body.newImages)) {
    const processedImages = [];
    
    for (const image of req.body.newImages) {
      if (image.startsWith('data:image')) {
        const result = await cloudinary.uploader.upload(image, {
          folder: 'kohinoor-gemstones',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        });
        
        processedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
          alt: req.body.name?.english || 'Gemstone image'
        });
      }
    }
    
    // Add new images to existing ones
    req.body.images = [...(gemstone.images || []), ...processedImages];
    delete req.body.newImages;
  }

  // Handle image deletion
  if (req.body.deleteImages && Array.isArray(req.body.deleteImages)) {
    for (const publicId of req.body.deleteImages) {
      await cloudinary.uploader.destroy(publicId);
    }
    
    // Remove deleted images from the array
    req.body.images = gemstone.images.filter(
      img => !req.body.deleteImages.includes(img.publicId)
    );
    delete req.body.deleteImages;
  }

  gemstone = await Gemstone.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('addedBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Gemstone updated successfully',
    data: {
      gemstone
    }
  });
});

// @desc    Delete gemstone
// @route   DELETE /api/gemstones/:id
// @access  Private (Admin)
export const deleteGemstone = asyncHandler(async (req, res, next) => {
  const gemstone = await Gemstone.findById(req.params.id);

  if (!gemstone) {
    throw new AppError('Gemstone not found', 404);
  }

  // Delete images from Cloudinary
  if (gemstone.images && gemstone.images.length > 0) {
    for (const image of gemstone.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }
  }

  await gemstone.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Gemstone deleted successfully'
  });
});

// @desc    Toggle gemstone trending status
// @route   PUT /api/gemstones/:id/trending
// @access  Private (Admin)
export const toggleTrending = asyncHandler(async (req, res, next) => {
  const gemstone = await Gemstone.findById(req.params.id);

  if (!gemstone) {
    throw new AppError('Gemstone not found', 404);
  }

  gemstone.trending = !gemstone.trending;
  await gemstone.save();

  res.status(200).json({
    success: true,
    message: `Gemstone ${gemstone.trending ? 'marked as trending' : 'removed from trending'}`,
    data: {
      gemstone
    }
  });
});

// @desc    Get gemstone statistics
// @route   GET /api/gemstones/stats/overview
// @access  Private (Admin)
export const getGemstoneStats = asyncHandler(async (req, res, next) => {
  const totalGemstones = await Gemstone.countDocuments({ isActive: true });
  const trendingGemstones = await Gemstone.countDocuments({ trending: true, isActive: true });
  const categoriesStats = await Gemstone.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const recentGemstones = await Gemstone.find({ isActive: true })
    .select('name images createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  const topViewed = await Gemstone.find({ isActive: true })
    .select('name images viewCount')
    .sort({ viewCount: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalGemstones,
        trendingGemstones,
        categoriesStats,
        recentGemstones,
        topViewed
      }
    }
  });
}); 