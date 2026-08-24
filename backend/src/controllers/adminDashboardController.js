import User from '../models/User.js';
import Gemstone from '../models/Gemstone.js';
import BusinessInfo from '../models/BusinessInfo.js';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Predefined gemstones
const PREDEFINED_GEMSTONES = [
  { name: 'Diamond', urdu: 'Heera', category: 'Diamond' },
  { name: 'Emerald', urdu: 'Zamurrad', category: 'Emerald' },
  { name: 'Ruby', urdu: 'Yaqoot', category: 'Ruby' },
  { name: 'Sapphire', urdu: 'Neelam', category: 'Sapphire' },
  { name: 'Topaz', urdu: 'Pukhraj', category: 'Topaz' },
  { name: 'Coral', urdu: 'Marjan', category: 'Coral' },
  { name: 'Pearl', urdu: 'Moti', category: 'Pearl' },
  { name: 'Turquoise', urdu: 'Feroza', category: 'Turquoise' },
  { name: 'Onyx', urdu: 'Sulemani Pathar', category: 'Onyx' },
  { name: 'Aqeeq (Agate)', urdu: 'Aqeeq', category: 'Aqeeq' },
  { name: 'Moonstone', urdu: 'Dur-e-Najaf', category: 'Moonstone' },
  { name: 'Zircon', urdu: 'Zarqun', category: 'Zircon' },
  { name: 'Opal', urdu: 'Opal', category: 'Opal' },
  { name: 'Tourmaline', urdu: 'Turmari', category: 'Tourmaline' },
  { name: 'Garnet', urdu: 'Yaman', category: 'Garnet' }
];

// Utility function to get frontend URL based on environment
const getFrontendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.FRONTEND_URL || 'https://kohinoorgemstone.vercel.app';
  } else {
    return process.env.FRONTEND_DEV_URL_VITE || 'http://localhost:5173';
  }
};

// Authentication middleware
export const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/admin/login');
};

// Show login page
export const showLogin = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { 
    title: 'Admin Login - Kohinoor Gemstone',
    error: null 
  });
};

// Handle login
export const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.render('admin/login', {
        title: 'Admin Login - Kohinoor Gemstone',
        error: 'Email and password are required'
      });
    }
    
    // Find user (explicitly select password field)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.render('admin/login', {
        title: 'Admin Login - Kohinoor Gemstone',
        error: 'Invalid email or password'
      });
    }
    
    // Check if user has password field
    if (!user.password) {
      console.error('User found but no password field:', user);
      return res.render('admin/login', {
        title: 'Admin Login - Kohinoor Gemstone',
        error: 'Invalid email or password'
      });
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.render('admin/login', {
        title: 'Admin Login - Kohinoor Gemstone',
        error: 'Invalid email or password'
      });
    }
    
    // Check if user is admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.render('admin/login', {
        title: 'Admin Login - Kohinoor Gemstone',
        error: 'Access denied. Admin privileges required.'
      });
    }
    
    // Set session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('admin/login', {
      title: 'Admin Login - Kohinoor Gemstone',
      error: 'An error occurred during login'
    });
  }
};

// Handle logout
export const handleLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/admin/login');
  });
};

// Show dashboard
export const showDashboard = async (req, res) => {
  try {
    // Get basic stats
    const totalGemstones = await Gemstone.countDocuments({ isActive: true });
    const trendingGemstones = await Gemstone.countDocuments({ isTrending: true, isActive: true });
    const featuredGemstones = await Gemstone.countDocuments({ featured: true, isActive: true });
    const totalViews = await Gemstone.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);

    // Category breakdown
    const categoryStats = await Gemstone.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, views: { $sum: '$viewCount' } } },
      { $sort: { count: -1 } }
    ]);

    // Recent gemstones with more details
    const recentGemstones = await Gemstone.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name category images createdAt isTrending viewCount priceRange availability')
      .populate('addedBy', 'name');

    // Top performing gemstones
    const topViewedGemstones = await Gemstone.find({ isActive: true })
      .sort({ viewCount: -1 })
      .limit(5)
      .select('name category images viewCount priceRange');

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrends = await Gemstone.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, isActive: true } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Availability stats
    const availabilityStats = await Gemstone.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$availability', count: { $sum: 1 } } }
    ]);

    // Price range distribution
    const priceRangeStats = await Gemstone.aggregate([
      { $match: { isActive: true, 'priceRange.min': { $exists: true } } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$priceRange.min', 50000] }, then: 'Under ₹50K' },
                { case: { $lt: ['$priceRange.min', 100000] }, then: '₹50K-₹1L' },
                { case: { $lt: ['$priceRange.min', 200000] }, then: '₹1L-₹2L' },
                { case: { $lt: ['$priceRange.min', 500000] }, then: '₹2L-₹5L' }
              ],
              default: 'Above ₹5L'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard - Kohinoor Gemstone',
      user: req.session.user,
      stats: {
        totalGemstones,
        trendingGemstones,
        featuredGemstones,
        totalViews: totalViews[0]?.totalViews || 0
      },
      categoryStats,
      recentGemstones,
      topViewedGemstones,
      monthlyTrends,
      availabilityStats,
      priceRangeStats,
      frontendUrl: getFrontendUrl()
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('admin/error', {
      title: 'Error - Kohinoor Gemstone',
      error: 'Failed to load dashboard'
    });
  }
};

// Show gemstones
export const showGemstones = async (req, res) => {
  try {
    const gemstones = await Gemstone.find()
      .sort({ createdAt: -1 });
    
    // Get success/error messages from query params
    const success = req.query.success ? decodeURIComponent(req.query.success) : null;
    const error = req.query.error ? decodeURIComponent(req.query.error) : null;
    
    res.render('admin/gemstones', {
      title: 'Gemstone Collection - Kohinoor Admin',
      user: req.session.user,
      gemstones,
      success,
      error
    });
  } catch (error) {
    console.error('Gemstones error:', error);
    res.status(500).render('admin/error', {
      title: 'Error - Kohinoor Gemstone',
      error: 'Failed to load gemstones'
    });
  }
};

// Show add gemstone page
export const showAddGemstone = (req, res) => {
  res.render('admin/add-gemstone', {
    title: 'Add Gemstone - Kohinoor Gemstone',
    user: req.session.user,
    predefinedGemstones: PREDEFINED_GEMSTONES,
    error: null,
    success: null
  });
};

// Handle add gemstone form submission
export const handleAddGemstone = async (req, res) => {
  try {
    const { name, urduName, category, summary, description, purpose, color, isTrending } = req.body;
    
    // Upload images to Cloudinary
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'kohinoor-gemstones',
          transformation: [
            { width: 800, height: 600, crop: 'fill', quality: 'auto' }
          ]
        });
        imageUrls.push({
          url: result.secure_url,
          publicId: result.public_id
        });
        
        // Delete temp file
        fs.unlinkSync(file.path);
      }
    }
    
    // Create gemstone with proper field mapping
    const gemstone = new Gemstone({
      name: {
        english: name,
        urdu: urduName || name  // Allow fallback to English if Urdu not provided
      },
      category,
      summary,
      description,
      purpose: purpose ? purpose.split(',').map(p => p.trim()).filter(p => p) : [],
      color: color || 'Not specified',
      images: imageUrls,
      isTrending: isTrending === 'on',
      addedBy: req.session.user.id  // Add the required addedBy field
    });
    
    await gemstone.save();
    
    res.render('admin/add-gemstone', {
      title: 'Add Gemstone - Kohinoor Gemstone',
      user: req.session.user,
      predefinedGemstones: PREDEFINED_GEMSTONES,
      error: null,
      success: 'Gemstone added successfully!'
    });
  } catch (error) {
    console.error('Add gemstone error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (e) {}
      });
    }
    
    res.render('admin/add-gemstone', {
      title: 'Add Gemstone - Kohinoor Gemstone',
      user: req.session.user,
      predefinedGemstones: PREDEFINED_GEMSTONES,
      error: 'Failed to add gemstone: ' + error.message,
      success: null
    });
  }
};

// Show edit gemstone page
export const showEditGemstone = async (req, res) => {
  try {
    const gemstone = await Gemstone.findById(req.params.id);
    if (!gemstone) {
      return res.status(404).render('admin/error', {
        title: 'Error - Kohinoor Gemstone',
        error: 'Gemstone not found'
      });
    }
    
    res.render('admin/edit-gemstone', {
      title: 'Edit Gemstone - Kohinoor Gemstone',
      user: req.session.user,
      gemstone,
      predefinedGemstones: PREDEFINED_GEMSTONES,
      error: null,
      success: null
    });
  } catch (error) {
    console.error('Edit gemstone error:', error);
    res.status(500).render('admin/error', {
      title: 'Error - Kohinoor Gemstone',
      error: 'Failed to load gemstone'
    });
  }
};

// Handle edit gemstone
export const handleEditGemstone = async (req, res) => {
  try {
    console.log('Edit gemstone request body:', req.body);
    console.log('Edit gemstone files:', req.files);
    
    const gemstone = await Gemstone.findById(req.params.id);
    if (!gemstone) {
      return res.status(404).render('admin/error', {
        title: 'Error - Kohinoor Gemstone',
        error: 'Gemstone not found'
      });
    }

    // Extract and process form data
    const updateData = {
      name: {
        english: req.body.name?.english || req.body['name[english]'] || '',
        urdu: req.body.name?.urdu || req.body['name[urdu]'] || ''
      },
      category: req.body.category,
      color: req.body.color,
      summary: req.body.summary,
      description: req.body.description,
      origin: req.body.origin,
      astrologyBenefits: req.body.astrologyBenefits,
      uses: req.body.uses,
      availability: req.body.availability,
      trending: req.body.trending === 'true',
      featured: req.body.featured === 'true',
      isActive: req.body.isActive === 'true'
    };

    // Handle purpose array
    if (req.body.purpose) {
      updateData.purpose = Array.isArray(req.body.purpose) ? req.body.purpose : [req.body.purpose];
    }

    // Handle weight
    if (req.body.weight) {
      updateData.weight = {
        value: parseFloat(req.body.weight?.value || req.body['weight[value]']) || undefined,
        unit: req.body.weight?.unit || req.body['weight[unit]'] || 'carats'
      };
    }

    // Handle dimensions
    if (req.body.dimensions) {
      updateData.dimensions = {
        length: parseFloat(req.body.dimensions?.length || req.body['dimensions[length]']) || undefined,
        width: parseFloat(req.body.dimensions?.width || req.body['dimensions[width]']) || undefined,
        height: parseFloat(req.body.dimensions?.height || req.body['dimensions[height]']) || undefined,
        unit: req.body.dimensions?.unit || req.body['dimensions[unit]'] || 'mm'
      };
    }

    // Handle certification
    if (req.body.certification) {
      updateData.certification = {
        certified: req.body.certification?.certified === 'true' || req.body['certification[certified]'] === 'true',
        certificateNumber: req.body.certification?.certificateNumber || req.body['certification[certificateNumber]'] || '',
        certifyingBody: req.body.certification?.certifyingBody || req.body['certification[certifyingBody]'] || ''
      };
    }

    // Handle price range
    if (req.body.priceRange) {
      updateData.priceRange = {
        min: parseFloat(req.body.priceRange?.min || req.body['priceRange[min]']) || undefined,
        max: parseFloat(req.body.priceRange?.max || req.body['priceRange[max]']) || undefined,
        currency: req.body.priceRange?.currency || req.body['priceRange[currency]'] || 'INR'
      };
    }

    // Handle SEO meta
    if (req.body.seoMeta) {
      updateData.seoMeta = {
        title: req.body.seoMeta?.title || req.body['seoMeta[title]'] || '',
        description: req.body.seoMeta?.description || req.body['seoMeta[description]'] || '',
        keywords: []
      };
    }

    // Handle tags
    if (req.body.tags) {
      updateData.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      // Also add tags to SEO keywords
      if (updateData.seoMeta) {
        updateData.seoMeta.keywords = updateData.tags;
      }
    }

    // Handle current images (images to keep)
    let currentImages = [];
    if (req.body.keepImages) {
      const keepImageIds = Array.isArray(req.body.keepImages) ? req.body.keepImages : [req.body.keepImages];
      currentImages = gemstone.images.filter(img => keepImageIds.includes(img.publicId));
      
      // Delete removed images from Cloudinary
      const removedImages = gemstone.images.filter(img => !keepImageIds.includes(img.publicId));
      for (const img of removedImages) {
        try {
          await cloudinary.uploader.destroy(img.publicId);
          console.log('Deleted image from Cloudinary:', img.publicId);
        } catch (error) {
          console.error('Failed to delete image from Cloudinary:', error);
        }
      }
    }

    // Handle new image uploads
    const newImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const b64 = Buffer.from(file.buffer).toString('base64');
          const dataURI = `data:${file.mimetype};base64,${b64}`;

          const result = await cloudinary.uploader.upload(dataURI, {
            folder: `kohinoor-gemstones/${updateData.name.english.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')}`,
            transformation: [
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          });

          newImages.push({
            url: result.secure_url,
            publicId: result.public_id,
            alt: `${updateData.name.english} image ${newImages.length + 1}`
          });

          console.log('Uploaded new image:', result.public_id);
        } catch (error) {
          console.error('Failed to upload image:', error);
        }
      }
    }

    // Combine current and new images
    updateData.images = [...currentImages, ...newImages];

    // Update the gemstone
    Object.assign(gemstone, updateData);
    await gemstone.save();

    console.log('Gemstone updated successfully:', gemstone._id);

    res.render('admin/edit-gemstone', {
      title: 'Edit Gemstone - Kohinoor Gemstone',
      user: req.session.user,
      gemstone,
      predefinedGemstones: PREDEFINED_GEMSTONES,
      error: null,
      success: 'Gemstone updated successfully!'
    });

  } catch (error) {
    console.error('Update gemstone error:', error);
    
    try {
      const gemstone = await Gemstone.findById(req.params.id);
      res.render('admin/edit-gemstone', {
        title: 'Edit Gemstone - Kohinoor Gemstone',
        user: req.session.user,
        gemstone,
        predefinedGemstones: PREDEFINED_GEMSTONES,
        error: 'Failed to update gemstone: ' + error.message,
        success: null
      });
    } catch (renderError) {
      console.error('Render error:', renderError);
      res.status(500).render('admin/error', {
        title: 'Error - Kohinoor Gemstone',
        error: 'Failed to update gemstone and render page'
      });
    }
  }
};

// Handle delete gemstone
export const handleDeleteGemstone = async (req, res) => {
  try {
    const gemstone = await Gemstone.findById(req.params.id);
    if (!gemstone) {
      if (req.headers['content-type'] === 'application/json' || req.xhr) {
        return res.status(404).json({ error: 'Gemstone not found' });
      } else {
        return res.redirect('/admin/gemstones?error=' + encodeURIComponent('Gemstone not found'));
      }
    }
    
    // Delete images from Cloudinary
    for (const image of gemstone.images) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (e) {
        console.error('Failed to delete image:', e);
      }
    }
    
    await Gemstone.findByIdAndDelete(req.params.id);
    
    // Return JSON for AJAX requests, redirect for form submissions
    if (req.headers['content-type'] === 'application/json' || req.xhr) {
      res.json({ success: true, message: 'Gemstone deleted successfully' });
    } else {
      res.redirect('/admin/gemstones?success=' + encodeURIComponent('Gemstone deleted successfully'));
    }
  } catch (error) {
    console.error('Delete gemstone error:', error);
    if (req.headers['content-type'] === 'application/json' || req.xhr) {
      res.status(500).json({ error: 'Failed to delete gemstone' });
    } else {
      res.redirect('/admin/gemstones?error=' + encodeURIComponent('Failed to delete gemstone'));
    }
  }
};

// Handle toggle trending
export const handleToggleTrending = async (req, res) => {
  try {
    const gemstone = await Gemstone.findById(req.params.id);
    if (!gemstone) {
      if (req.headers['content-type'] === 'application/json' || req.xhr) {
        return res.status(404).json({ error: 'Gemstone not found' });
      } else {
        return res.redirect('/admin/gemstones?error=' + encodeURIComponent('Gemstone not found'));
      }
    }
    
    const wasTrending = gemstone.isTrending;
    gemstone.isTrending = !gemstone.isTrending;
    await gemstone.save();
    
    const message = `Gemstone ${gemstone.isTrending ? 'marked as trending' : 'removed from trending'}`;
    
    // Return JSON for AJAX requests, redirect for form submissions
    if (req.headers['content-type'] === 'application/json' || req.xhr) {
      res.json({ 
        success: true, 
        message,
        isTrending: gemstone.isTrending 
      });
    } else {
      res.redirect('/admin/gemstones?success=' + encodeURIComponent(message));
    }
  } catch (error) {
    console.error('Toggle trending error:', error);
    if (req.headers['content-type'] === 'application/json' || req.xhr) {
      res.status(500).json({ error: 'Failed to toggle trending status' });
    } else {
      res.redirect('/admin/gemstones?error=' + encodeURIComponent('Failed to toggle trending status'));
    }
  }
};

// Bulk operations on gemstones
export const handleBulkOperations = async (req, res) => {
  try {
    const { action, gemstoneIds, updateData } = req.body;
    
    if (!gemstoneIds || !Array.isArray(gemstoneIds) || gemstoneIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one gemstone'
      });
    }

    let result;
    let message;

    switch (action) {
      case 'trending':
        result = await Gemstone.updateMany(
          { _id: { $in: gemstoneIds } },
          { $set: { isTrending: updateData.trending === 'true' } }
        );
        message = `Updated trending status for ${result.modifiedCount} gemstones`;
        break;

      case 'featured':
        result = await Gemstone.updateMany(
          { _id: { $in: gemstoneIds } },
          { $set: { featured: updateData.featured === 'true' } }
        );
        message = `Updated featured status for ${result.modifiedCount} gemstones`;
        break;

      case 'category':
        result = await Gemstone.updateMany(
          { _id: { $in: gemstoneIds } },
          { $set: { category: updateData.category } }
        );
        message = `Updated category for ${result.modifiedCount} gemstones`;
        break;

      case 'availability':
        result = await Gemstone.updateMany(
          { _id: { $in: gemstoneIds } },
          { $set: { availability: updateData.availability } }
        );
        message = `Updated availability for ${result.modifiedCount} gemstones`;
        break;

      case 'delete':
        result = await Gemstone.updateMany(
          { _id: { $in: gemstoneIds } },
          { $set: { isActive: false } }
        );
        message = `Archived ${result.modifiedCount} gemstones`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid bulk operation'
        });
    }

    res.json({
      success: true,
      message,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Bulk operation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operation'
    });
  }
};

// Analytics endpoint for dashboard
export const getDashboardAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Daily gemstone additions
    const dailyAdditions = await Gemstone.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Popular categories over time
    const categoryTrends = await Gemstone.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            category: '$category',
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 },
          totalViews: { $sum: '$viewCount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        dailyAdditions,
        categoryTrends,
        period
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
};

// Show business info page
export const showBusinessInfo = async (req, res) => {
  try {
    // Force fresh data fetch with no caching
    const businessInfo = await BusinessInfo.findOne().lean();
    console.log('📊 Admin Dashboard - Fresh business info loaded:', {
      shopName: businessInfo?.shopName,
      tagline: businessInfo?.tagline,
      updatedAt: businessInfo?.updatedAt
    });
    
    res.render('admin/business-info', {
      title: 'Business Information - Kohinoor Gemstone',
      user: req.session.user,
      businessInfo,
      error: null,
      success: null
    });
  } catch (error) {
    console.error('Business info error:', error);
    res.status(500).render('admin/error', {
      title: 'Error - Kohinoor Gemstone',
      error: 'Failed to load business information'
    });
  }
};

// Handle update business info
export const handleUpdateBusinessInfo = async (req, res) => {
  try {
    const formData = req.body;
    console.log('🔄 Received form data for update:', {
      shopName: formData.shopName,
      tagline: formData.tagline,
      email: formData['contact[email]'],
      phone: formData['contact[phone]'],
      street: formData['address[street]'],
      timestamp: new Date().toISOString()
    });
    
    console.log('📋 Full form data keys:', Object.keys(formData));
    
    // Parse nested form data with better handling
    const updateData = {
      shopName: formData.shopName || 'Kohinoor Gemstone',
      tagline: formData.tagline || 'Premium Gemstones for Life\'s Precious Moments',
      description: formData.description || formData.about || 'We are a family-owned gemstone business dedicated to providing authentic, certified gemstones.',
      contact: {
        phone: formData['contact[phone]'] || formData.phone || '+911234567890',
        whatsapp: formData['contact[whatsapp]'] || formData.whatsapp || '+911234567890',
        email: formData['contact[email]'] || formData.email || 'info@kohinoorgemstone.com'
      },
      address: {
        street: formData['address[street]'] || formData.street || '123 Gemstone Street',
        area: formData['address[area]'] || formData.area || 'Jewelry District',
        city: formData['address[city]'] || formData.city || 'Mumbai',
        state: formData['address[state]'] || formData.state || 'Maharashtra',
        pincode: formData['address[pincode]'] || formData.pincode || '400001',
        country: formData['address[country]'] || formData.country || 'India'
      },
      googleMapsUrl: formData.googleMapsUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.8574447892247!2d72.8310437!3d19.0544472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDAzJzE2LjAiTiA3MsKwNDknNTEuOCJF!5e0!3m2!1sen!2sin!4v1234567890',
      socialMedia: {
        facebook: formData['socialMedia[facebook]'] || '',
        instagram: formData['socialMedia[instagram]'] || '',
        twitter: formData['socialMedia[twitter]'] || '',
        youtube: formData['socialMedia[youtube]'] || '',
        linkedin: formData['socialMedia[linkedin]'] || ''
      },
      // Ensure updatedAt is set to current timestamp
      updatedAt: new Date()
    };

    // Handle business hours if provided
    if (formData.hours || Object.keys(formData).some(key => key.startsWith('hours['))) {
      updateData.businessHours = {};
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      days.forEach(day => {
        const openTime = formData[`hours[${day}][open]`] || '10:00';
        const closeTime = formData[`hours[${day}][close]`] || '20:00';
        const isClosed = !openTime || !closeTime || (day === 'sunday'); // Default Sunday closed
        
        updateData.businessHours[day] = {
          open: openTime,
          close: closeTime,
          closed: isClosed
        };
      });
    }

    // Handle heritage information
    if (formData.foundedYear || formData.story || formData.specialties) {
      updateData.heritage = {
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : 1985,
        story: formData.story || 'Founded by Master Gem Dealer Rajesh Kumar, Kohinoor Gemstone Palace has been serving astrology enthusiasts and jewelry lovers for over three decades.',
        specialties: formData.specialties ? 
          formData.specialties.split(',').map(s => s.trim()).filter(s => s) : 
          ['Astrological Gemstones', 'Certified Precious Stones', 'Custom Jewelry', 'Gem Consultation']
      };
    }

    console.log('💾 Saving update data:', {
      shopName: updateData.shopName,
      tagline: updateData.tagline,
      'contact.email': updateData.contact.email,
      'contact.phone': updateData.contact.phone,
      'address.street': updateData.address.street,
      'address.city': updateData.address.city,
      updatedAt: updateData.updatedAt
    });
    
    // Clean up any empty string values that might cause validation issues
    const cleanValue = (obj) => {
      if (typeof obj === 'string') {
        return obj.trim() || undefined;
      }
      if (typeof obj === 'object' && obj !== null) {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
          const cleanedValue = cleanValue(value);
          if (cleanedValue !== undefined) {
            cleaned[key] = cleanedValue;
          }
        }
        return Object.keys(cleaned).length > 0 ? cleaned : undefined;
      }
      return obj;
    };

    // Apply cleaning but ensure required fields always have values
    const finalUpdateData = {
      ...updateData,
      contact: {
        email: updateData.contact.email || 'info@kohinoorgemstone.com',
        phone: updateData.contact.phone || '+911234567890',
        whatsapp: updateData.contact.whatsapp || '+911234567890'
      },
      address: {
        street: updateData.address.street || '123 Gemstone Street',
        area: updateData.address.area || 'Jewelry District',
        city: updateData.address.city || 'Mumbai',
        state: updateData.address.state || 'Maharashtra',
        pincode: updateData.address.pincode || '400001',
        country: updateData.address.country || 'India'
      }
    };
    
    // Use findOneAndUpdate with explicit options to ensure fresh data
    const businessInfo = await BusinessInfo.findOneAndUpdate(
      {},
      finalUpdateData,
      { 
        new: true,          // Return updated document
        upsert: true,       // Create if doesn't exist
        runValidators: true, // Run schema validation
        setDefaultsOnInsert: true
      }
    );

    console.log('✅ Update completed, rendering with fresh data:', {
      shopName: businessInfo?.shopName,
      tagline: businessInfo?.tagline,
      'contact.email': businessInfo?.contact?.email,
      updatedAt: businessInfo?.updatedAt
    });
    
    // Render the page with the updated data
    res.render('admin/business-info', {
      title: 'Business Information - Kohinoor Gemstone',
      user: req.session.user,
      businessInfo,
      error: null,
      success: 'Business information updated successfully!'
    });
  } catch (error) {
    console.error('❌ Update business info error:', error);
    console.error('❌ Error details:', error.message);
    
    // Fetch fresh data for error case too
    try {
      const businessInfo = await BusinessInfo.findOne().lean();
      res.render('admin/business-info', {
        title: 'Business Information - Kohinoor Gemstone',
        user: req.session.user,
        businessInfo,
        error: 'Failed to update business information: ' + error.message,
        success: null
      });
    } catch (fetchError) {
      console.error('❌ Failed to fetch business info for error render:', fetchError);
      res.status(500).render('admin/error', {
        title: 'Error - Kohinoor Gemstone',
        error: 'Failed to update and load business information'
      });
    }
  }
}; 