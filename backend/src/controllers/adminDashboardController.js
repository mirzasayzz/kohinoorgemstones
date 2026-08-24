import User from '../models/User.js';
import Gemstone from '../models/Gemstone.js';
import BusinessInfo from '../models/BusinessInfo.js';
import Category from '../models/Category.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '../utils/sendEmail.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to get categories from database
const getCategories = async () => {
  try {
    return await Category.getActiveCategories();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Predefined gemstones with full details for Quick Select
const PREDEFINED_GEMSTONES = [
  { name: 'Ruby', urdu: 'یاقوت (Yaqoot)', value: 'Ruby', color: 'Deep Red', summary: 'Known as the king of gemstones, Ruby symbolizes passion, love, and vitality.', description: 'Ruby is one of the most precious gemstones in the world. It represents passion, love, and courage. In Vedic astrology, it is associated with the Sun and believed to bring success, fame, and leadership qualities.', purpose: ['Love', 'Success', 'Vitality', 'Leadership'] },
  { name: 'Emerald', urdu: 'زمرد (Zamurrad)', value: 'Emerald', color: 'Deep Green', summary: 'The stone of successful love, Emerald brings loyalty and domestic bliss.', description: 'Emerald is the sacred stone of the goddess Venus and represents unconditional love. It is known for bringing wisdom, growth, and patience. Associated with Mercury in astrology.', purpose: ['Love', 'Wisdom', 'Growth', 'Prosperity'] },
  { name: 'Sapphire', urdu: 'نیلم (Neelam)', value: 'Sapphire', color: 'Royal Blue', summary: 'A stone of wisdom and royalty, Sapphire brings mental clarity and spiritual insight.', description: 'Blue Sapphire is one of the most powerful gemstones. It is associated with Saturn and known for bringing rapid results. It enhances focus, discipline, and spiritual awareness.', purpose: ['Wisdom', 'Protection', 'Spiritual Growth', 'Success'] },
  { name: 'Diamond', urdu: 'ہیرا (Heera)', value: 'Diamond', color: 'Crystal Clear', summary: 'The ultimate symbol of purity and strength, Diamond represents eternal love.', description: 'Diamond is the hardest natural substance and symbolizes invincibility, purity, and eternal love. Associated with Venus, it brings luxury, beauty, and harmonious relationships.', purpose: ['Love', 'Purity', 'Strength', 'Luxury'] },
  { name: 'Pearl', urdu: 'موتی (Moti)', value: 'Pearl', color: 'White/Cream', summary: 'Symbol of purity and innocence, Pearl brings calmness and emotional balance.', description: 'Pearl is an organic gemstone formed in oysters. It is associated with the Moon and brings emotional balance, calmness, and maternal love. Known for enhancing beauty and charm.', purpose: ['Peace', 'Emotional Balance', 'Beauty', 'Calmness'] },
  { name: 'Coral', urdu: 'مونگا (Moonga)', value: 'Coral', color: 'Red/Orange', summary: 'A protective stone that brings courage and helps overcome fears.', description: 'Red Coral is associated with Mars and brings courage, vitality, and protection. It helps overcome fears, laziness, and brings success in competitive fields.', purpose: ['Courage', 'Protection', 'Energy', 'Victory'] },
  { name: 'Topaz', urdu: 'پکھراج (Pukhraj)', value: 'Topaz', color: 'Yellow/Golden', summary: 'The stone of Jupiter, bringing wisdom, prosperity, and good fortune.', description: 'Yellow Topaz or Pukhraj is associated with Jupiter, the planet of wisdom and fortune. It brings prosperity, good health, academic success, and spiritual growth.', purpose: ['Prosperity', 'Wisdom', 'Good Fortune', 'Health'] },
  { name: 'Turquoise', urdu: 'فیروزہ (Feroza)', value: 'Turquoise', color: 'Sky Blue/Green', summary: 'An ancient protective stone that brings good luck and positive energy.', description: 'Turquoise is one of the oldest known gemstones, prized for its protective properties. It brings good fortune, success in endeavors, and protects travelers.', purpose: ['Protection', 'Good Luck', 'Communication', 'Healing'] },
  { name: 'Aqeeq', urdu: 'عقیق (Aqeeq)', value: 'Aqeeq', color: 'Red/Brown/Black', summary: 'A blessed stone in Islamic tradition, bringing protection and prosperity.', description: 'Aqeeq (Agate) holds special significance in Islamic tradition. It is believed to ward off evil, bring prosperity, and provide protection. Wearing it is considered Sunnah.', purpose: ['Protection', 'Prosperity', 'Blessings', 'Health'] },
  { name: 'Onyx', urdu: 'سلیمانی (Sulemani)', value: 'Onyx', color: 'Black', summary: 'A powerful protection stone that absorbs negative energy.', description: 'Black Onyx is a powerful protective stone. It absorbs and transforms negative energy, provides emotional and physical strength, and helps in making wise decisions.', purpose: ['Protection', 'Strength', 'Focus', 'Grounding'] },
  { name: 'Moonstone', urdu: 'چندرکانتا (Chandrakanta)', value: 'Moonstone', color: 'Milky White/Blue Sheen', summary: 'The stone of new beginnings, connected to moon and intuition.', description: 'Moonstone is connected to the moon and feminine energy. It enhances intuition, promotes inspiration, and brings success in love and business matters.', purpose: ['Intuition', 'New Beginnings', 'Love', 'Fertility'] },
  { name: 'Garnet', urdu: 'یمنی (Yamani)', value: 'Garnet', color: 'Deep Red/Wine', summary: 'A stone of passion and energy that revitalizes and balances energy.', description: 'Garnet is known as the stone of commitment and passion. It energizes, purifies, and balances energy. It brings courage and hope in difficult situations.', purpose: ['Passion', 'Energy', 'Commitment', 'Courage'] },
  { name: 'Opal', urdu: 'اوپل (Opal)', value: 'Opal', color: 'Multi-color Play', summary: 'A stone of creativity and inspiration with magical color play.', description: 'Opal displays a beautiful play of colors and is associated with creativity, inspiration, and imagination. It amplifies emotions and brings out one\'s true self.', purpose: ['Creativity', 'Inspiration', 'Confidence', 'Love'] },
  { name: 'Zircon', urdu: 'زرقون (Zarqun)', value: 'Zircon', color: 'Various Colors', summary: 'Known for its brilliance, Zircon brings wisdom and prosperity.', description: 'Natural Zircon is one of the oldest minerals on Earth. It brings wisdom, honor, and prosperity. It helps in achieving goals and brings spiritual growth.', purpose: ['Wisdom', 'Prosperity', 'Honor', 'Healing'] },
  { name: 'Tourmaline', urdu: 'ٹورمالین (Turmali)', value: 'Tourmaline', color: 'Various Colors', summary: 'A powerful healing stone available in rainbow of colors.', description: 'Tourmaline comes in many colors, each with unique properties. It is known for its powerful healing and protective energies. It cleanses and balances all chakras.', purpose: ['Healing', 'Protection', 'Balance', 'Creativity'] }
];

// Utility function to get frontend URL from environment variable
const getFrontendUrl = () => {
  return process.env.FRONTEND_URL || '';
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
    
    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    
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

// Show forgot password page
export const showForgotPassword = (req, res) => {
  res.render('admin/forgot-password', {
    title: 'Forgot Password - Kohinoor Admin',
    error: null,
    success: null
  });
};

// Handle forgot password
export const handleForgotPassword = async (req, res) => {
  try {
    const rawEmail = req.body.email;
    const email = rawEmail ? String(rawEmail).trim().toLowerCase() : '';
    console.log('🔒 Forgot password requested for:', email);
    
    if (!email) {
      return res.render('admin/forgot-password', {
        title: 'Forgot Password - Kohinoor Admin',
        error: 'Please provide your email address',
        success: null
      });
    }

    // Ensure an admin account actually exists for this email
    const user = await User.findOne({
      email,
      role: { $in: ['admin', 'super_admin'] },
      isActive: true
    });

    if (!user) {
      console.log('🔍 No admin user found for email:', email);
      return res.render('admin/forgot-password', {
        title: 'Forgot Password - Kohinoor Admin',
        error: 'No admin account found with this email address.',
        success: null
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const baseUrl = process.env.BASE_URL;
    const resetUrl = `${baseUrl}/admin/reset-password/${resetToken}`;

    console.log('📧 Sending reset email to:', user.email);
    console.log('📧 Reset URL:', resetUrl);

    try {
      await sendPasswordResetEmail(user.email, resetUrl, user.name);
      console.log('✅ Reset email sent successfully!');
      res.render('admin/forgot-password', {
        title: 'Forgot Password - Kohinoor Admin',
        error: null,
        success: 'Password reset email sent! Check your inbox.',
        resetUrl: null
      });
    } catch (emailError) {
      console.error('❌ Email send error:', emailError.message);
      // Don't clear the token - show the link directly instead
      console.log('📧 Reset link (email failed):', resetUrl);
      
      res.render('admin/forgot-password', {
        title: 'Forgot Password - Kohinoor Admin',
        error: null,
        success: 'Email service unavailable. Use the link below:',
        resetUrl: resetUrl
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.render('admin/forgot-password', {
      title: 'Forgot Password - Kohinoor Admin',
      error: 'An error occurred. Please try again.',
      success: null
    });
  }
};

// Show reset password page
export const showResetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('admin/reset-password', {
        title: 'Reset Password - Kohinoor Admin',
        error: 'Invalid or expired reset token',
        token: null,
        success: null
      });
    }

    res.render('admin/reset-password', {
      title: 'Reset Password - Kohinoor Admin',
      error: null,
      token: req.params.token,
      success: null
    });
  } catch (error) {
    console.error('Show reset password error:', error);
    res.render('admin/reset-password', {
      title: 'Reset Password - Kohinoor Admin',
      error: 'An error occurred',
      token: null,
      success: null
    });
  }
};

// Handle reset password
export const handleResetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const token = req.params.token;

    if (!password || !confirmPassword) {
      return res.render('admin/reset-password', {
        title: 'Reset Password - Kohinoor Admin',
        error: 'Please provide both password fields',
        token,
        success: null
      });
    }

    if (password !== confirmPassword) {
      return res.render('admin/reset-password', {
        title: 'Reset Password - Kohinoor Admin',
        error: 'Passwords do not match',
        token,
        success: null
      });
    }

    if (password.length < 6) {
      return res.render('admin/reset-password', {
        title: 'Reset Password - Kohinoor Admin',
        error: 'Password must be at least 6 characters',
        token,
        success: null
      });
    }

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('admin/reset-password', {
        title: 'Reset Password - Kohinoor Admin',
        error: 'Invalid or expired reset token',
        token: null,
        success: null
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Send confirmation email
    try {
      await sendPasswordChangedEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Confirmation email error:', emailError);
    }

    res.render('admin/reset-password', {
      title: 'Reset Password - Kohinoor Admin',
      error: null,
      token: null,
      success: 'Password reset successful! You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.render('admin/reset-password', {
      title: 'Reset Password - Kohinoor Admin',
      error: 'An error occurred. Please try again.',
      token: req.params.token,
      success: null
    });
  }
};

// Show change password page (for logged in users)
export const showChangePassword = (req, res) => {
  res.render('admin/change-password', {
    title: 'Change Password - Kohinoor Admin',
    user: req.session.user,
    error: null,
    success: null
  });
};

// Handle change password
export const handleChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.user.id;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.render('admin/change-password', {
        title: 'Change Password - Kohinoor Admin',
        user: req.session.user,
        error: 'Please fill in all fields',
        success: null
      });
    }

    if (newPassword !== confirmPassword) {
      return res.render('admin/change-password', {
        title: 'Change Password - Kohinoor Admin',
        user: req.session.user,
        error: 'New passwords do not match',
        success: null
      });
    }

    if (newPassword.length < 6) {
      return res.render('admin/change-password', {
        title: 'Change Password - Kohinoor Admin',
        user: req.session.user,
        error: 'New password must be at least 6 characters',
        success: null
      });
    }

    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.redirect('/admin/logout');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.render('admin/change-password', {
        title: 'Change Password - Kohinoor Admin',
        user: req.session.user,
        error: 'Current password is incorrect',
        success: null
      });
    }

    user.password = newPassword;
    await user.save();

    // Send confirmation email
    try {
      await sendPasswordChangedEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Confirmation email error:', emailError);
    }

    res.render('admin/change-password', {
      title: 'Change Password - Kohinoor Admin',
      user: req.session.user,
      error: null,
      success: 'Password changed successfully!'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.render('admin/change-password', {
      title: 'Change Password - Kohinoor Admin',
      user: req.session.user,
      error: 'An error occurred. Please try again.',
      success: null
    });
  }
};

// Show dashboard
export const showDashboard = async (req, res) => {
  try {
    // Get basic stats
    const totalGemstones = await Gemstone.countDocuments({ isActive: true });
    const trendingGemstones = await Gemstone.countDocuments({ trending: true, isActive: true });
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
      .select('name category images createdAt trending viewCount priceRange availability')
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
export const showAddGemstone = async (req, res) => {
  try {
    const categories = await getCategories();
    res.render('admin/add-gemstone', {
      title: 'Add Gemstone - Kohinoor Gemstone',
      user: req.session.user,
      categories: categories,
      predefinedGemstones: PREDEFINED_GEMSTONES,
      error: null,
      success: null
    });
  } catch (error) {
    console.error('Error loading add gemstone page:', error);
    res.render('admin/add-gemstone', {
      title: 'Add Gemstone - Kohinoor Gemstone',
      user: req.session.user,
      categories: [],
      predefinedGemstones: PREDEFINED_GEMSTONES,
      error: 'Failed to load categories',
      success: null
    });
  }
};

// Handle add gemstone form submission
export const handleAddGemstone = async (req, res) => {
  try {
    const { name, urduName, category, customCategory, summary, description, purpose, color, isTrending, price, priceMin, priceMax, ratti, letter, discountPercentage, discountMessage, discountActive, certified, certificateNumber, certifyingBody } = req.body;
    
    // Upload gemstone images to Cloudinary
    const imageUrls = [];
    const gemstoneImages = req.files?.images || [];
    if (gemstoneImages.length > 0) {
      for (const file of gemstoneImages) {
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
    
    // Upload certification image if provided (independent of certified checkbox)
    let certificationImage = undefined;
    const certImageFiles = req.files?.certificationImage || [];
    if (certImageFiles.length > 0) {
      try {
        const certFile = certImageFiles[0];
        const certResult = await cloudinary.uploader.upload(certFile.path, {
          folder: 'kohinoor-certifications',
          transformation: [
            { width: 800, height: 600, crop: 'limit', quality: 'auto' }
          ]
        });
        certificationImage = {
          url: certResult.secure_url,
          publicId: certResult.public_id
        };
        fs.unlinkSync(certFile.path);
      } catch (uploadErr) {
        console.error('Failed to upload certification image:', uploadErr.message || 'Upload error');
      }
    }
    
    // Parse purpose properly
    let parsedPurpose = [];
    if (purpose) {
      const validPurposes = ['Love', 'Health', 'Wealth', 'Protection', 'Spiritual Growth', 'Success', 'Peace', 'Wisdom'];
      let purposes = typeof purpose === 'string' ? purpose.split(',') : purpose;
      if (Array.isArray(purposes)) {
        purposes = purposes.flatMap(p => typeof p === 'string' ? p.split(',').map(s => s.trim()) : p).filter(p => p);
      }
      parsedPurpose = purposes.filter(p => validPurposes.includes(p));
    }
    
    // Create gemstone with proper field mapping
    const gemstone = new Gemstone({
      name: {
        english: name,
        urdu: urduName || name  // Allow fallback to English if Urdu not provided
      },
      category,
      customCategory: category === 'Other' ? customCategory : undefined,
      summary,
      description,
      purpose: parsedPurpose,
      color: color || 'Not specified',
      images: imageUrls,
      trending: isTrending === 'on',
      price: priceMin ? parseFloat(priceMin) : (price ? parseFloat(price) : undefined),
      priceRange: (priceMin || priceMax) ? {
        min: priceMin ? parseFloat(priceMin) : undefined,
        max: priceMax ? parseFloat(priceMax) : undefined,
        currency: 'INR'
      } : undefined,
      ratti: ratti ? parseFloat(ratti) : undefined,
      letter: letter ? letter.toUpperCase().charAt(0) : undefined,
      discount: {
        percentage: discountPercentage ? parseInt(discountPercentage) : 0,
        message: discountMessage || 'Special Offer!',
        isActive: discountActive === 'on'
      },
      certification: {
        certified: certified === 'on',
        certificateNumber: certificateNumber || '',
        certifyingBody: certifyingBody || '',
        ...(certificationImage ? { certificationImage } : {})
      },
      addedBy: req.session.user.id  // Add the required addedBy field
    });
    
    await gemstone.save();
    
    const categories = await getCategories();
    res.render('admin/add-gemstone', {
      title: 'Add Gemstone - Kohinoor Gemstone',
      user: req.session.user,
      categories: categories,
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
    
    // Parse validation errors
    let errorMessage = 'Failed to add gemstone';
    if (error.name === 'ValidationError') {
      const errorFields = Object.keys(error.errors);
      const fieldMessages = errorFields.map(field => {
        const err = error.errors[field];
        const readableField = field.replace(/\./g, ' → ').replace(/([A-Z])/g, ' $1').trim();
        return `• ${readableField}: ${err.message}`;
      });
      errorMessage = 'Please fix the following errors:\n' + fieldMessages.join('\n');
    } else {
      errorMessage = error.message || 'An unexpected error occurred';
    }
    
    const categories = await getCategories();
    res.render('admin/add-gemstone', {
      title: 'Add Gemstone - Kohinoor Gemstone',
      user: req.session.user,
      categories: categories,
      predefinedGemstones: PREDEFINED_GEMSTONES,
      error: errorMessage,
      success: null
    });
  }
};

// Show edit gemstone page
export const showEditGemstone = async (req, res) => {
  try {
    const [gemstone, categories] = await Promise.all([
      Gemstone.findById(req.params.id),
      getCategories()
    ]);
    
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
      categories: categories,
      predefinedGemstones: categories,
      error: null,
      fieldErrors: {},
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
        english: req.body.name?.english || req.body['name[english]'] || req.body.name || '',
        urdu: req.body.name?.urdu || req.body['name[urdu]'] || req.body.urduName || ''
      },
      category: req.body.category,
      customCategory: req.body.category === 'Other' ? req.body.customCategory : undefined,
      color: req.body.color,
      summary: req.body.summary,
      description: req.body.description,
      origin: req.body.origin,
      astrologyBenefits: req.body.astrologyBenefits,
      uses: req.body.uses,
      availability: req.body.availability,
      trending: req.body.isTrending === 'on' || req.body.trending === 'on',
      featured: req.body.isFeatured === 'on' || req.body.featured === 'on',
      isActive: req.body.isActive === 'on' || req.body.isActive === 'true',
      price: req.body.priceMin ? parseFloat(req.body.priceMin) : (req.body.price ? parseFloat(req.body.price) : undefined),
      priceRange: (req.body.priceMin || req.body.priceMax) ? {
        min: req.body.priceMin ? parseFloat(req.body.priceMin) : undefined,
        max: req.body.priceMax ? parseFloat(req.body.priceMax) : undefined,
        currency: 'INR'
      } : undefined,
      ratti: req.body.ratti ? parseFloat(req.body.ratti) : undefined,
      letter: req.body.letter ? req.body.letter.toUpperCase().charAt(0) : undefined,
      discount: {
        percentage: req.body.discountPercentage ? parseInt(req.body.discountPercentage) : 0,
        message: req.body.discountMessage || 'Special Offer!',
        isActive: req.body.discountActive === 'on'
      },
      certification: {
        certified: req.body.certified === 'on',
        certificateNumber: req.body.certified === 'on' ? req.body.certificateNumber : '',
        certifyingBody: req.body.certified === 'on' ? req.body.certifyingBody : '',
        certificationImage: gemstone.certification?.certificationImage?.url 
          ? gemstone.certification.certificationImage 
          : null
      }
    };

    // Handle purpose array - properly parse comma-separated or array values
    if (req.body.purpose) {
      let purposes = req.body.purpose;
      
      // If it's a string, split by comma
      if (typeof purposes === 'string') {
        purposes = purposes.split(',').map(p => p.trim()).filter(p => p);
      }
      
      // If it's an array, flatten and clean
      if (Array.isArray(purposes)) {
        purposes = purposes.flatMap(p => 
          typeof p === 'string' ? p.split(',').map(s => s.trim()) : p
        ).filter(p => p);
      }
      
      // Valid purpose values
      const validPurposes = ['Love', 'Health', 'Wealth', 'Protection', 'Spiritual Growth', 'Success', 'Peace', 'Wisdom'];
      updateData.purpose = purposes.filter(p => validPurposes.includes(p));
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

    // Handle certification (preserve existing image)
    if (req.body.certification) {
      updateData.certification = {
        certified: req.body.certification?.certified === 'true' || req.body['certification[certified]'] === 'true',
        certificateNumber: req.body.certification?.certificateNumber || req.body['certification[certificateNumber]'] || '',
        certifyingBody: req.body.certification?.certifyingBody || req.body['certification[certifyingBody]'] || '',
        certificationImage: gemstone.certification?.certificationImage?.url 
          ? gemstone.certification.certificationImage 
          : null
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
    } else {
      // If no keepImages specified, keep all existing images
      currentImages = gemstone.images || [];
    }

    // Handle new image uploads (using upload.fields)
    const newImages = [];
    const gemstoneImages = req.files?.images || [];
    if (gemstoneImages.length > 0) {
      for (const file of gemstoneImages) {
        try {
          // Use file.path for disk storage (multer dest: 'uploads/')
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'kohinoor-gemstones',
            transformation: [
              { width: 800, height: 600, crop: 'fill', quality: 'auto' }
            ]
          });

          newImages.push({
            url: result.secure_url,
            publicId: result.public_id,
            alt: `${updateData.name.english} image ${newImages.length + 1}`
          });

          // Delete temp file
          fs.unlinkSync(file.path);

          console.log('Uploaded new image:', result.public_id);
        } catch (error) {
          console.error('Failed to upload image:', error);
          // Try to delete temp file even on error
          try {
            if (file.path) fs.unlinkSync(file.path);
          } catch (e) {}
        }
      }
    }

    // Combine current and new images
    updateData.images = [...currentImages, ...newImages];
    
    // Handle certification image - all fields independent
    const certImageFiles = req.files?.certificationImage || [];
    const deleteCertImage = req.body.deleteCertImage === 'true';
    
    console.log('🔍 Certification image handling:', {
      deleteCertImage,
      deleteCertImageRaw: req.body.deleteCertImage,
      hasCertImageFiles: certImageFiles.length > 0,
      existingImage: gemstone.certification?.certificationImage?.publicId
    });
    
    // Initialize certification if not set
    if (!updateData.certification) {
      updateData.certification = {};
    }
    
    // Handle explicit delete request
    if (deleteCertImage) {
      console.log('🗑️ Delete flag is true, checking for existing image...');
      if (gemstone.certification?.certificationImage?.publicId) {
        try {
          await cloudinary.uploader.destroy(gemstone.certification.certificationImage.publicId);
          console.log('✅ Deleted certification image from Cloudinary:', gemstone.certification.certificationImage.publicId);
        } catch (e) {
          console.error('Failed to delete certification image from Cloudinary:', e);
        }
      }
      // Set to null to properly remove from MongoDB
      updateData.certification.certificationImage = null;
      // Also directly unset on the gemstone object
      gemstone.certification.certificationImage = undefined;
    }
    // Handle new upload (replaces existing if any)
    else if (certImageFiles.length > 0) {
      try {
        const certFile = certImageFiles[0];
        
        // Delete old certification image if exists
        if (gemstone.certification?.certificationImage?.publicId) {
          try {
            await cloudinary.uploader.destroy(gemstone.certification.certificationImage.publicId);
          } catch (e) {
            console.error('Failed to delete old certification image:', e);
          }
        }
        
        const certResult = await cloudinary.uploader.upload(certFile.path, {
          folder: 'kohinoor-certifications',
          transformation: [
            { width: 800, height: 600, crop: 'limit', quality: 'auto' }
          ]
        });
        
        updateData.certification.certificationImage = {
          url: certResult.secure_url,
          publicId: certResult.public_id
        };
        
        fs.unlinkSync(certFile.path);
        console.log('Uploaded certification image:', certResult.public_id);
      } catch (error) {
        console.error('Failed to upload certification image:', error.message || 'Upload error');
      }
    }
    // Keep existing certification image if no new upload and no delete
    else if (gemstone.certification?.certificationImage) {
      updateData.certification.certificationImage = gemstone.certification.certificationImage;
    }

    // Update the gemstone
    Object.assign(gemstone, updateData);
    await gemstone.save();

    console.log('Gemstone updated successfully:', gemstone._id);

    const categories = await getCategories();
    res.render('admin/edit-gemstone', {
      title: 'Edit Gemstone - Kohinoor Gemstone',
      user: req.session.user,
      gemstone,
      categories: categories,
      error: null,
      fieldErrors: {},
      success: 'Gemstone updated successfully!'
    });

  } catch (error) {
    console.error('Update gemstone error:', error);
    
    // Parse validation errors to provide better messages
    let errorMessage = 'Failed to update gemstone';
    let fieldErrors = {};
    
    if (error.name === 'ValidationError') {
      const errorFields = Object.keys(error.errors);
      const fieldMessages = errorFields.map(field => {
        const err = error.errors[field];
        fieldErrors[field] = err.message;
        
        // Make field name more readable
        const readableField = field.replace(/\./g, ' → ').replace(/([A-Z])/g, ' $1').trim();
        return `• ${readableField}: ${err.message}`;
      });
      errorMessage = 'Please fix the following errors:\n' + fieldMessages.join('\n');
    } else {
      errorMessage = error.message || 'An unexpected error occurred';
    }
    
    try {
      const [gemstone, categories] = await Promise.all([
        Gemstone.findById(req.params.id),
        getCategories()
      ]);
      res.render('admin/edit-gemstone', {
        title: 'Edit Gemstone - Kohinoor Gemstone',
        user: req.session.user,
        gemstone,
        categories: categories,
        error: errorMessage,
        fieldErrors: fieldErrors,
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
    
    // Check if AJAX request
    const isAjax = req.xhr || 
      (req.headers.accept && req.headers.accept.includes('application/json')) ||
      (req.headers['content-type'] && req.headers['content-type'].includes('application/json'));
    
    if (!gemstone) {
      if (isAjax) {
        return res.status(404).json({ success: false, error: 'Gemstone not found' });
      } else {
        return res.redirect('/admin/gemstones?error=' + encodeURIComponent('Gemstone not found'));
      }
    }
    
    // Delete images from Cloudinary
    for (const image of gemstone.images) {
      try {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      } catch (e) {
        console.error('Failed to delete image:', e);
      }
    }
    
    await Gemstone.findByIdAndDelete(req.params.id);
    
    console.log('Gemstone deleted successfully:', req.params.id);
    
    // Return JSON for AJAX requests, redirect for form submissions
    if (isAjax) {
      res.json({ success: true, message: 'Gemstone deleted successfully' });
    } else {
      res.redirect('/admin/gemstones?success=' + encodeURIComponent('Gemstone deleted successfully'));
    }
  } catch (error) {
    console.error('Delete gemstone error:', error);
    const isAjax = req.xhr || 
      (req.headers.accept && req.headers.accept.includes('application/json')) ||
      (req.headers['content-type'] && req.headers['content-type'].includes('application/json'));
      
    if (isAjax) {
      res.status(500).json({ success: false, error: 'Failed to delete gemstone' });
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
    
    const wasTrending = gemstone.trending;
    gemstone.trending = !gemstone.trending;
    await gemstone.save();
    
    const message = `Gemstone ${gemstone.trending ? 'marked as trending' : 'removed from trending'}`;
    
    // Return JSON for AJAX requests, redirect for form submissions
    if (req.headers['content-type'] === 'application/json' || req.xhr) {
      res.json({ 
        success: true, 
        message,
        trending: gemstone.trending 
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
          { $set: { trending: updateData.trending === 'true' } }
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
      email: formData['contact[email]'] || formData.contact?.email,
      phone: formData['contact[phone]'] || formData.contact?.phone,
      street: formData['address[street]'] || formData.address?.street,
      timestamp: new Date().toISOString()
    });

    // Load singleton business info (creates default if missing)
    let businessInfo = await BusinessInfo.getBusinessInfo();
    if (!businessInfo) {
      businessInfo = new BusinessInfo({});
    }

    // Helper to set value if provided (non-empty)
    const setIfProvided = (obj, key, value) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        obj[key] = value;
      }
    };

    // Prefer nested objects when present
    const nestedContact = formData.contact || {};
    const nestedAddress = formData.address || {};
    const nestedHours = formData.hours || null;

    // Basic info
    setIfProvided(businessInfo, 'shopName', formData.shopName);
    setIfProvided(businessInfo, 'tagline', formData.tagline);
    // Prefer detailed about field, fallback to description
    setIfProvided(businessInfo, 'description', formData.about ?? formData.description);

    // Contact
    businessInfo.contact = businessInfo.contact || {};
    setIfProvided(
      businessInfo.contact,
      'phone',
      nestedContact.phone ?? formData['contact[phone]'] ?? formData.phone
    );
    setIfProvided(
      businessInfo.contact,
      'whatsapp',
      nestedContact.whatsapp ?? formData['contact[whatsapp]'] ?? formData.whatsapp
    );
    setIfProvided(
      businessInfo.contact,
      'email',
      nestedContact.email ?? formData['contact[email]'] ?? formData.email
    );

    // Address
    businessInfo.address = businessInfo.address || {};
    setIfProvided(
      businessInfo.address,
      'street',
      nestedAddress.street ?? formData['address[street]'] ?? formData.street
    );
    setIfProvided(
      businessInfo.address,
      'area',
      nestedAddress.area ?? formData['address[area]'] ?? formData.area
    );
    setIfProvided(
      businessInfo.address,
      'city',
      nestedAddress.city ?? formData['address[city]'] ?? formData.city
    );
    setIfProvided(
      businessInfo.address,
      'state',
      nestedAddress.state ?? formData['address[state]'] ?? formData.state
    );
    setIfProvided(
      businessInfo.address,
      'pincode',
      nestedAddress.pincode ?? formData['address[pincode]'] ?? formData.pincode
    );
    setIfProvided(
      businessInfo.address,
      'country',
      nestedAddress.country ?? formData['address[country]'] ?? formData.country
    );

    // Google Maps URL
    setIfProvided(businessInfo, 'googleMapsUrl', formData.googleMapsUrl);

    // Social media
    businessInfo.socialMedia = businessInfo.socialMedia || {};
    setIfProvided(businessInfo.socialMedia, 'facebook', formData['socialMedia[facebook]'] ?? formData.facebook);
    setIfProvided(businessInfo.socialMedia, 'instagram', formData['socialMedia[instagram]'] ?? formData.instagram);
    setIfProvided(businessInfo.socialMedia, 'twitter', formData['socialMedia[twitter]'] ?? formData.twitter);
    setIfProvided(businessInfo.socialMedia, 'youtube', formData['socialMedia[youtube]'] ?? formData.youtube);
    setIfProvided(businessInfo.socialMedia, 'linkedin', formData['socialMedia[linkedin]'] ?? formData.linkedin);

    // Business hours from either nested hours object or bracketed inputs
    const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    const nestedBusinessHours = formData.businessHours || nestedHours;
    const hasNestedHours = nestedBusinessHours && typeof nestedBusinessHours === 'object';
    const hasBracketHours = Object.keys(formData).some(k => k.startsWith('hours[') || k.startsWith('businessHours['));
    if (hasNestedHours || hasBracketHours) {
      businessInfo.businessHours = businessInfo.businessHours || {};

      days.forEach(day => {
        let open;
        let close;
        let closed;
        if (hasNestedHours) {
          open = nestedBusinessHours?.[day]?.open;
          close = nestedBusinessHours?.[day]?.close;
          closed = nestedBusinessHours?.[day]?.closed;
        } else {
          open = formData[`businessHours[${day}][open]`] || formData[`hours[${day}][open]`];
          close = formData[`businessHours[${day}][close]`] || formData[`hours[${day}][close]`];
          closed = formData[`businessHours[${day}][closed]`] || formData[`hours[${day}][closed]`];
        }

        const isClosed = closed === 'on' || closed === true || !(open && close);
        if (open || close || businessInfo.businessHours[day]) {
          businessInfo.businessHours[day] = {
            open: open || businessInfo.businessHours[day]?.open || undefined,
            close: close || businessInfo.businessHours[day]?.close || undefined,
            closed: isClosed
          };
        }
      });
    }

    // Heritage info (support both nested and bracket notation)
    const heritage = formData.heritage || {};
    const foundedYearRaw = formData['heritage[foundedYear]'] ?? heritage.foundedYear ?? formData.foundedYear;
    const foundedYear = foundedYearRaw ? parseInt(foundedYearRaw) : undefined;
    const story = formData['heritage[story]'] ?? heritage.story ?? formData.story;
    const specialtiesStr = formData['heritage[specialties]'] ?? heritage.specialties ?? formData.specialties;
    
    if (foundedYear || story || specialtiesStr) {
      businessInfo.heritage = businessInfo.heritage || {};
      if (foundedYear && !Number.isNaN(foundedYear)) {
        businessInfo.heritage.foundedYear = foundedYear;
      }
      if (story !== undefined) businessInfo.heritage.story = story;
      if (specialtiesStr !== undefined) {
        const arr = String(specialtiesStr)
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        businessInfo.heritage.specialties = arr;
      }
    }

    // Policies
    const returnPolicy = formData['policies[returnPolicy]'] ?? formData.policies?.returnPolicy;
    const shippingPolicy = formData['policies[shippingPolicy]'] ?? formData.policies?.shippingPolicy;
    if (returnPolicy || shippingPolicy) {
      businessInfo.policies = businessInfo.policies || {};
      if (returnPolicy !== undefined) businessInfo.policies.returnPolicy = returnPolicy;
      if (shippingPolicy !== undefined) businessInfo.policies.shippingPolicy = shippingPolicy;
    }

    // Store Certification (JG Gems Testing Lab, etc.)
    const storeCert = formData.storeCertification || {};
    const certEnabled = formData['storeCertification[enabled]'] || storeCert.enabled;
    const certLabName = formData['storeCertification[labName]'] ?? storeCert.labName;
    const certLabAddress = formData['storeCertification[labAddress]'] ?? storeCert.labAddress;
    const certLabWebsite = formData['storeCertification[labWebsite]'] ?? storeCert.labWebsite;
    const certTagline = formData['storeCertification[tagline]'] ?? storeCert.tagline;
    const certDescription = formData['storeCertification[description]'] ?? storeCert.description;

    businessInfo.storeCertification = businessInfo.storeCertification || {};
    businessInfo.storeCertification.enabled = certEnabled === 'on' || certEnabled === true || certEnabled === 'true';
    if (certLabName) businessInfo.storeCertification.labName = certLabName;
    if (certLabAddress !== undefined) businessInfo.storeCertification.labAddress = certLabAddress;
    if (certLabWebsite !== undefined) businessInfo.storeCertification.labWebsite = certLabWebsite;
    if (certTagline !== undefined) businessInfo.storeCertification.tagline = certTagline;
    if (certDescription !== undefined) businessInfo.storeCertification.description = certDescription;

    // Handle certification image upload
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'kohinoor-certifications',
          transformation: [
            { width: 800, height: 600, crop: 'limit', quality: 'auto' }
          ]
        });
        businessInfo.storeCertification.certificationImage = result.secure_url;
        
        // Clean up temp file
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Failed to delete temp file:', err);
        });
      } catch (uploadError) {
        console.error('Failed to upload certification image:', uploadError.message || 'Upload error');
      }
    }

    // SEO Settings
    const seoSettings = formData.seoSettings || {};
    const metaTitle = formData['seoSettings[metaTitle]'] ?? seoSettings.metaTitle;
    const metaDescription = formData['seoSettings[metaDescription]'] ?? seoSettings.metaDescription;
    const keywordsStr = formData['seoSettings[keywords]'] ?? seoSettings.keywords;
    
    if (metaTitle || metaDescription || keywordsStr) {
      businessInfo.seoSettings = businessInfo.seoSettings || {};
      if (metaTitle !== undefined) businessInfo.seoSettings.metaTitle = metaTitle;
      if (metaDescription !== undefined) businessInfo.seoSettings.metaDescription = metaDescription;
      if (keywordsStr !== undefined) {
        const keywords = String(keywordsStr)
          .split(',')
          .map(s => s.trim().toLowerCase())
          .filter(Boolean);
        businessInfo.seoSettings.keywords = keywords;
      }
    }

    // Set lastUpdatedBy if session user exists
    if (req.session?.user?.id) {
      businessInfo.lastUpdatedBy = req.session.user.id;
    }

    await businessInfo.save(); // triggers pre('save') to recompute fullAddress and updates timestamps

    console.log('✅ Update completed, rendering with fresh data:', {
      shopName: businessInfo?.shopName,
      tagline: businessInfo?.tagline,
      'contact.email': businessInfo?.contact?.email,
      updatedAt: businessInfo?.updatedAt
    });

    // If API/AJAX request, respond with JSON
    const wantsJson = req.originalUrl.startsWith('/admin/api') ||
      (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) ||
      (req.headers.accept && req.headers.accept.includes('application/json'));

    if (wantsJson) {
      return res.status(200).json({
        success: true,
        message: 'Business information updated successfully',
        data: { businessInfo: businessInfo.toObject() }
      });
    }

    // Render with the updated document
    res.render('admin/business-info', {
      title: 'Business Information - Kohinoor Gemstone',
      user: req.session.user,
      businessInfo: businessInfo.toObject(),
      error: null,
      success: 'Business information updated successfully!'
    });
  } catch (error) {
    console.error('❌ Update business info error:', error);
    console.error('❌ Error details:', error.message);

    const wantsJson = req.originalUrl.startsWith('/admin/api') ||
      (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) ||
      (req.headers.accept && req.headers.accept.includes('application/json'));

    if (wantsJson) {
      return res.status(400).json({ success: false, message: error.message });
    }

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

// ===== CATEGORY MANAGEMENT =====

// Show categories page
export const showCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('addedBy', 'name email').sort({ order: 1, name: 1 });
    res.render('admin/categories', {
      title: 'Manage Categories - Kohinoor Admin',
      user: req.session.user,
      categories,
      success: req.query.success,
      error: req.query.error,
      currentPage: 'categories'
    });
  } catch (error) {
    console.error('Error loading categories:', error);
    res.render('admin/categories', {
      title: 'Manage Categories - Kohinoor Admin',
      user: req.session.user,
      categories: [],
      success: null,
      error: 'Failed to load categories',
      currentPage: 'categories'
    });
  }
};

// Add new category
export const addCategory = async (req, res) => {
  try {
    const { name, urdu, description, order, emoji } = req.body;
    
    // Create value from name (for database storage)
    const value = name.trim().replace(/\s+/g, ' ');
    
    // Create label with emoji if provided
    const label = `${emoji || '💎'} ${name}${urdu ? ` (${urdu})` : ''}`;
    
    const category = new Category({
      name: name.trim(),
      urdu: urdu?.trim(),
      value,
      label,
      description: description?.trim(),
      order: parseInt(order) || 0,
      addedBy: req.session.user.id
    });
    
    await category.save();
    res.redirect('/admin/categories?success=' + encodeURIComponent('Category added successfully!'));
  } catch (error) {
    console.error('Error adding category:', error);
    const errorMessage = error.code === 11000 ? 'Category name already exists!' : 'Failed to add category: ' + error.message;
    res.redirect('/admin/categories?error=' + encodeURIComponent(errorMessage));
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Check if any gemstones are using this category
    const gemstonesUsingCategory = await Gemstone.countDocuments({ category: category.value });
    if (gemstonesUsingCategory > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category. ${gemstonesUsingCategory} gemstone(s) are using this category.` 
      });
    }
    
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully!' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

// Toggle category status
export const toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    category.isActive = !category.isActive;
    await category.save();
    
    res.json({ 
      success: true, 
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully!`,
      isActive: category.isActive
    });
  } catch (error) {
    console.error('Error toggling category status:', error);
    res.status(500).json({ error: 'Failed to update category status' });
  }
}; 