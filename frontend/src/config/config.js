// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      PROFILE: '/auth/profile',
      CHANGE_PASSWORD: '/auth/change-password'
    },
    
    // Gemstone endpoints
    GEMSTONES: {
      GET_ALL: '/gemstones',
      GET_ONE: '/gemstones',
      CREATE: '/gemstones',
      UPDATE: '/gemstones',
      DELETE: '/gemstones',
      TRENDING: '/gemstones/trending',
      NEW_ARRIVALS: '/gemstones/new-arrivals',
      SEARCH: '/gemstones/search',
      PREDEFINED: '/gemstones/predefined',
      STATS: '/gemstones/stats/overview',
      TOGGLE_TRENDING: '/gemstones'
    },
    
    // Business endpoints
    BUSINESS: {
      INFO: '/business/info',
      CONTACT: '/business/contact',
      CONTACT_COMPLETE: '/business/contact-complete',
      CONTACT_ALL: '/business/contact-all',
      ADDRESS: '/business/address',
      HOURS: '/business/hours',
      SOCIAL: '/business/social',
      HERITAGE: '/business/heritage',
      POLICIES: '/business/policies',
      SEO: '/business/seo',
      THEME: '/business/theme',
      CERTIFICATIONS: '/business/certifications'
    },
    
    // Upload endpoints
    UPLOAD: {
      SINGLE: '/upload/image',
      MULTIPLE: '/upload/images',
      BASE64: '/upload/base64',
      DELETE: '/upload/image',
      TRANSFORMATIONS: '/upload/transformations'
    },
    
    // AI endpoints
    AI: {
      GEMSTONE_CHAT: '/gemstone-ai',
      STATUS: '/gemstone-ai/status'
    }
  }
};

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
};

// Site Configuration
export const SITE_CONFIG = {
  BASE_URL: import.meta.env.VITE_SITE_URL || 'http://localhost:5173',
  NAME: 'Kohinoor Gemstone',
  DOMAIN: 'kohinoorgemstone.com'
};

// Business Information (fallback values - real values fetched from API)
export const BUSINESS_INFO = {
  NAME: import.meta.env.VITE_SHOP_NAME || 'Kohinoor Gemstone',
  TAGLINE: 'Premium Gemstones for Life\'s Precious Moments',
  DESCRIPTION: 'Family-owned gemstone business offering certified natural gemstones with heritage and trust.',
  
  // Contact info managed via admin dashboard - these are fallback values only
  CONTACT: {
    EMAIL: 'info@kohinoorgemstone.com',
    PHONE: '+911234567890',
    WHATSAPP: '+911234567890'
  },
  
  ADDRESS: {
    FULL: '123 Gemstone Street, Jewelry District, Mumbai, Maharashtra, India',
    STREET: '123 Gemstone Street',
    AREA: 'Jewelry District',
    CITY: 'Mumbai',
    STATE: 'Maharashtra',
    PINCODE: '400001',
    COUNTRY: 'India'
  },
  
  SOCIAL_MEDIA: {
    FACEBOOK: 'https://facebook.com/kohinoorgemstone',
    INSTAGRAM: 'https://instagram.com/kohinoorgemstone',
    TWITTER: 'https://twitter.com/kohinoorgemstone',
    YOUTUBE: 'https://youtube.com/kohinoorgemstone'
  },
  
  GOOGLE_MAPS: {
    DEFAULT_EMBED_URL: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.8574447892247!2d72.8310437!3d19.0544472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDAzJzE2LjAiTiA3MsKwNDknNTEuOCJF!5e0!3m2!1sen!2sin!4v1234567890'
  }
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Kohinoor Gemstone',
  VERSION: '1.0.0',
  DESCRIPTION: 'Premium Gemstone Commerce Website',
  
  // Pagination
  ITEMS_PER_PAGE: {
    GEMSTONES: 12,
    ADMIN_GEMSTONES: 10
  },
  
  // Image settings
  IMAGE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    MAX_FILES: 10
  },
  
  // WhatsApp message template
  WHATSAPP: {
    MESSAGE_TEMPLATE: (gemstone, businessInfo) => {
      const shopName = businessInfo?.shopName || BUSINESS_INFO.NAME;
      const baseUrl = window.location.origin;
      
      return `Hello ${shopName},

I am interested in this gemstone:

Stone: ${gemstone.name.english} (${gemstone.name.urdu})
Category: ${gemstone.category}
Link: ${baseUrl}/gemstone/${gemstone.slug || gemstone._id}

Please provide more details and pricing information.

Thank you!`;
    }
  },
  
  // Theme colors
  COLORS: {
    SAPPHIRE: '#0F172A',
    RUBY: '#B91C1C',
    EMERALD: '#047857',
    GOLDEN: '#FACC15'
  },
  
  // Animation settings
  ANIMATIONS: {
    DURATION: {
      FAST: 200,
      NORMAL: 300,
      SLOW: 500
    },
    EASING: {
      SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',
      BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  }
};

// Gemstone Categories
export const GEMSTONE_CATEGORIES = [
  { value: 'Diamond', label: 'Diamond', urdu: 'ہیرا (Heera)' },
  { value: 'Emerald', label: 'Emerald', urdu: 'زمرد (Zamurrad)' },
  { value: 'Ruby', label: 'Ruby', urdu: 'یاقوت (Yaqoot)' },
  { value: 'Sapphire', label: 'Sapphire', urdu: 'نیلم (Neelam)' },
  { value: 'Topaz', label: 'Topaz', urdu: 'پکھراج (Pukhraj)' },
  { value: 'Coral', label: 'Coral', urdu: 'مرجان (Marjan)' },
  { value: 'Pearl', label: 'Pearl', urdu: 'موتی (Moti)' },
  { value: 'Turquoise', label: 'Turquoise', urdu: 'فیروزہ (Feroza)' },
  { value: 'Onyx', label: 'Onyx', urdu: 'سلیمانی پتھر (Sulemani Pathar)' },
  { value: 'Aqeeq', label: 'Aqeeq (Agate)', urdu: 'عقیق (Aqeeq)' },
  { value: 'Moonstone', label: 'Moonstone', urdu: 'دُرِ نجف (Dur-e-Najaf)' },
  { value: 'Zircon', label: 'Zircon', urdu: 'زرقون (Zarqun)' },
  { value: 'Opal', label: 'Opal', urdu: 'اوپل (Opal)' },
  { value: 'Tourmaline', label: 'Tourmaline', urdu: 'ترمری (Turmari)' },
  { value: 'Garnet', label: 'Garnet', urdu: 'یمن (Yaman) / گرنیٹ (Garnet)' },
  { value: 'Other', label: 'Other', urdu: 'دیگر (Other)' }
];

// Gemstone purposes
export const GEMSTONE_PURPOSES = [
  'Love',
  'Health',
  'Wealth',
  'Protection',
  'Spiritual Growth',
  'Success',
  'Peace',
  'Wisdom'
];

// Currency formats
export const CURRENCY_FORMAT = {
  INR: {
    symbol: '₹',
    code: 'INR',
    locale: 'en-IN'
  },
  USD: {
    symbol: '$',
    code: 'USD',
    locale: 'en-US'
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    locale: 'en-DE'
  }
};

export default {
  API_CONFIG,
  CLOUDINARY_CONFIG,
  BUSINESS_INFO,
  APP_CONFIG,
  GEMSTONE_CATEGORIES,
  GEMSTONE_PURPOSES,
  CURRENCY_FORMAT
}; 