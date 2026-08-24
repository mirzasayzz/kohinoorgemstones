import axios from 'axios';
import { API_CONFIG } from '../config/config';

// Enforce BASE_URL in production
if (import.meta.env.PROD && (!API_CONFIG.BASE_URL || API_CONFIG.BASE_URL.includes('localhost'))) {
  // eslint-disable-next-line no-console
  console.error('VITE_API_BASE_URL is not set for production; API calls will fail.');
}

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (import.meta.env.PROD) {
      // eslint-disable-next-line no-console
      console.error('API request failed:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }

    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }

    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'An unexpected error occurred';

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// Auth Services
export const authService = {
  // Login
  async login(credentials) {
    const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  // Logout
  async logout() {
    try {
      await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  async getMe() {
    return await api.get(API_CONFIG.ENDPOINTS.AUTH.ME);
  },

  // Update profile
  async updateProfile(profileData) {
    return await api.put(API_CONFIG.ENDPOINTS.AUTH.PROFILE, profileData);
  },

  // Change password
  async changePassword(passwordData) {
    return await api.put(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Get stored user data
  getUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }
};

// Gemstone Services
export const gemstoneService = {
  // Get all gemstones with filtering and pagination
  async getGemstones(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_CONFIG.ENDPOINTS.GEMSTONES.GET_ALL}${queryParams ? `?${queryParams}` : ''}`;
    return await api.get(url);
  },

  // Get single gemstone by ID or slug
  async getGemstone(identifier) {
    return await api.get(`${API_CONFIG.ENDPOINTS.GEMSTONES.GET_ONE}/${identifier}`);
  },

  // Get trending gemstones
  async getTrendingGemstones() {
    return await api.get(API_CONFIG.ENDPOINTS.GEMSTONES.TRENDING);
  },

  // Get new arrivals
  async getNewArrivals() {
    return await api.get(API_CONFIG.ENDPOINTS.GEMSTONES.NEW_ARRIVALS);
  },

  // Search gemstones
  async searchGemstones(query) {
    return await api.get(`${API_CONFIG.ENDPOINTS.GEMSTONES.SEARCH}/${encodeURIComponent(query)}`);
  },

  // Get predefined gemstones
  async getPredefinedGemstones() {
    return await api.get(API_CONFIG.ENDPOINTS.GEMSTONES.PREDEFINED);
  },

  // Create gemstone (Admin)
  async createGemstone(gemstoneData) {
    return await api.post(API_CONFIG.ENDPOINTS.GEMSTONES.CREATE, gemstoneData);
  },

  // Update gemstone (Admin)
  async updateGemstone(id, gemstoneData) {
    return await api.put(`${API_CONFIG.ENDPOINTS.GEMSTONES.UPDATE}/${id}`, gemstoneData);
  },

  // Delete gemstone (Admin)
  async deleteGemstone(id) {
    return await api.delete(`${API_CONFIG.ENDPOINTS.GEMSTONES.DELETE}/${id}`);
  },

  // Toggle trending status (Admin)
  async toggleTrending(id) {
    return await api.put(`${API_CONFIG.ENDPOINTS.GEMSTONES.TOGGLE_TRENDING}/${id}/trending`);
  },

  // Get gemstone statistics (Admin)
  async getGemstoneStats() {
    return await api.get(API_CONFIG.ENDPOINTS.GEMSTONES.STATS);
  }
};

// Business Services
export const businessService = {
  // Get business information
  async getBusinessInfo() {
    return await api.get(API_CONFIG.ENDPOINTS.BUSINESS.INFO);
  },

  // Update business information (Admin)
  async updateBusinessInfo(businessData) {
    return await api.put(API_CONFIG.ENDPOINTS.BUSINESS.INFO, businessData);
  },

  // Get contact information
  async getContactInfo() {
    return await api.get(API_CONFIG.ENDPOINTS.BUSINESS.CONTACT);
  },

  // Get complete contact information (includes address and maps)
  async getCompleteContactInfo() {
    return await api.get(API_CONFIG.ENDPOINTS.BUSINESS.CONTACT_COMPLETE);
  },

  // Update contact information (Admin)
  async updateContactInfo(contactData) {
    return await api.put(API_CONFIG.ENDPOINTS.BUSINESS.CONTACT, contactData);
  },

  // Update all contact information including address (Admin)
  async updateAllContactInfo(allContactData) {
    return await api.put(API_CONFIG.ENDPOINTS.BUSINESS.CONTACT_ALL, allContactData);
  },

  // Update address (Admin)
  async updateAddress(addressData) {
    return await api.put(API_CONFIG.ENDPOINTS.BUSINESS.ADDRESS, addressData);
  },

  // Update business hours (Admin)
  async updateBusinessHours(hoursData) {
    return await api.put(API_CONFIG.ENDPOINTS.BUSINESS.HOURS, hoursData);
  },

  // Update social media (Admin)
  async updateSocialMedia(socialData) {
    return await api.put(API_CONFIG.ENDPOINTS.BUSINESS.SOCIAL, socialData);
  },

  // Update heritage (Admin)
  async updateHeritage(heritageData) {
    return await api.put(API_CONFIG.ENDPOINTS.BUSINESS.HERITAGE, heritageData);
  },

  // Update policies (Admin)
  async updatePolicies(policiesData) {
    return await api.put(API_CONFIG.ENDPOINTS.BUSINESS.POLICIES, policiesData);
  },

  // Update SEO settings (Admin)
  async updateSEOSettings(seoData) {
    return await api.put(API_CONFIG.ENDPOINTS.BUSINESS.SEO, seoData);
  },

  // Update theme settings (Admin)
  async updateThemeSettings(themeData) {
    return await api.put(API_CONFIG.ENDPOINTS.BUSINESS.THEME, themeData);
  },

  // Submit contact form
  async submitContactForm(formData) {
    return await api.post('/business/contact-form', formData);
  },

  // Add certification (Admin)
  async addCertification(certificationData) {
    return await api.post(API_CONFIG.ENDPOINTS.BUSINESS.CERTIFICATIONS, certificationData);
  },

  // Delete certification (Admin)
  async deleteCertification(id) {
    return await api.delete(`${API_CONFIG.ENDPOINTS.BUSINESS.CERTIFICATIONS}/${id}`);
  }
};

// Upload Services
export const uploadService = {
  // Upload single image
  async uploadSingleImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    return await api.post(API_CONFIG.ENDPOINTS.UPLOAD.SINGLE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Upload multiple images
  async uploadMultipleImages(files) {
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });
    
    return await api.post(API_CONFIG.ENDPOINTS.UPLOAD.MULTIPLE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Upload base64 image
  async uploadBase64Image(imageData, folder = 'kohinoor-gemstones') {
    return await api.post(API_CONFIG.ENDPOINTS.UPLOAD.BASE64, {
      image: imageData,
      folder
    });
  },

  // Delete image
  async deleteImage(publicId) {
    return await api.delete(`${API_CONFIG.ENDPOINTS.UPLOAD.DELETE}/${publicId}`);
  },

  // Get image transformations
  async getImageTransformations(publicId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_CONFIG.ENDPOINTS.UPLOAD.TRANSFORMATIONS}/${publicId}${queryParams ? `?${queryParams}` : ''}`;
    return await api.get(url);
  }
};

// Utility Functions
export const apiUtils = {
  // Handle API errors
  handleError(error) {
    console.error('API Error:', error);
    
    if (error.status === 401) {
      return 'Authentication required. Please log in again.';
    } else if (error.status === 403) {
      return 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      return 'The requested resource was not found.';
    } else if (error.status === 500) {
      return 'Server error. Please try again later.';
    } else if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred.';
  },

  // Format price
  formatPrice(price, currency = 'INR') {
    if (!price) return '';
    
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return formatter.format(price);
  },

  // Format date
  formatDate(date) {
    if (!date) return '';
    
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  },

  // Debounce function for search
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Generate slug from text
  generateSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');
  }
};

// Export default api instance
export default api; 