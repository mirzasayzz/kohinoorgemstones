import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { businessService } from '../services/api';
import { SITE_CONFIG } from '../config/config';

const BusinessContext = createContext();

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

export const BusinessProvider = ({ children, onBusinessUpdate }) => {
  const [businessInfo, setBusinessInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Refs for managing intervals and preventing memory leaks
  const refreshIntervalRef = useRef(null);
  const lastUpdatedAtRef = useRef(null);
  const isLoadingRef = useRef(false);
  const hasInitiallyLoadedRef = useRef(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    } else {
      setDarkMode(prefersDark);
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Smart cache check - only fetch if data has changed
  const checkForUpdates = useCallback(async () => {
    if (isLoadingRef.current) return false;
    
    try {
      // Quick timestamp check without fetching full data
      const response = await businessService.getBusinessInfo();
      const serverUpdatedAt = response.data.businessInfo.updatedAt;
      
      if (!lastUpdatedAtRef.current || new Date(serverUpdatedAt) > new Date(lastUpdatedAtRef.current)) {
        console.log('🔄 Business data updated, refreshing...');
        return true; // Data has changed
      }
      
      return false; // No changes
    } catch (err) {
      console.error('Failed to check for updates:', err);
      return false;
    }
  }, []);

  const loadBusinessInfo = useCallback(async (forceRefresh = false, showNotification = false) => {
    if (isLoadingRef.current && !forceRefresh) return;
    
    try {
      isLoadingRef.current = true;
      if (forceRefresh || !businessInfo) {
        setLoading(true);
      }
      setError(null);
      
      // Fetch both business info and contact info concurrently
      const [businessResponse, contactResponse] = await Promise.all([
        businessService.getBusinessInfo(),
        businessService.getCompleteContactInfo()
      ]);
      
      // Update timestamp for cache invalidation
      const serverUpdatedAt = businessResponse.data.businessInfo.updatedAt;
      const wasUpdated = lastUpdatedAtRef.current && new Date(serverUpdatedAt) > new Date(lastUpdatedAtRef.current);
      lastUpdatedAtRef.current = serverUpdatedAt;
      setLastUpdated(serverUpdatedAt);
      
      // Merge the responses - correctly access nested businessInfo
      const backendBusiness = businessResponse.data.businessInfo || {};
      const completeContact = contactResponse.data?.contact || {};
      const mergedBusinessInfo = {
        ...backendBusiness,
        contact: {
          ...backendBusiness.contact,
          whatsapp: completeContact.whatsapp ?? backendBusiness.contact?.whatsapp,
          phone: completeContact.phone ?? backendBusiness.contact?.phone,
          email: completeContact.email ?? backendBusiness.contact?.email
        },
        address: completeContact.address || backendBusiness.address || {},
        googleMapsUrl: completeContact.googleMapsUrl ?? backendBusiness.googleMapsUrl || ''
      };
      
      setBusinessInfo(mergedBusinessInfo);
      console.log('✅ Business info loaded successfully');
      
      // Notify about automatic updates (not for initial load or manual refresh)
      if (hasInitiallyLoadedRef.current && wasUpdated && showNotification && onBusinessUpdate) {
        onBusinessUpdate(mergedBusinessInfo, {
          type: 'auto-update',
          message: 'Business information updated automatically! 🔄'
        });
      }
      
      hasInitiallyLoadedRef.current = true;
    } catch (err) {
      console.error('Failed to load business info:', err);
      setError(err.message || 'Failed to load business information');
      
      // Set fallback business info
      setBusinessInfo({
        shopName: 'Kohinoor Gemstone',
        tagline: 'Premium Authentic Gemstones',
        description: 'Family-owned gemstone business with heritage of trust and excellence.',
        contact: {
          email: 'info@kohinoorgemstone.com',
          phone: '+91 98765 43210',
          whatsapp: '+91 98765 43210'
        },
        address: {
          fullAddress: 'Mumbai, Maharashtra, India'
        },
        socialMedia: {},
        googleMapsUrl: ''
      });
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [businessInfo, onBusinessUpdate]);

  // Smart refresh that only loads if data has changed
  const smartRefresh = useCallback(async () => {
    const hasUpdates = await checkForUpdates();
    if (hasUpdates) {
      await loadBusinessInfo(false, true); // Show notification for automatic updates
    }
  }, [checkForUpdates, loadBusinessInfo]);

  // Force refresh method for manual updates
  const forceRefresh = useCallback(async () => {
    console.log('🔄 Force refreshing business data...');
    await loadBusinessInfo(true, false); // No notification for manual refresh
  }, [loadBusinessInfo]);

  // Setup automatic refresh intervals and visibility handling
  useEffect(() => {
    // Initial load
    loadBusinessInfo(true, false);

    // Setup periodic smart refresh every 30 seconds when tab is active
    const setupRefreshInterval = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      refreshIntervalRef.current = setInterval(() => {
        if (!document.hidden) { // Only refresh if tab is active
          smartRefresh();
        }
      }, 10000); // 10 seconds for testing (can be increased to 30000 for production)
    };

    setupRefreshInterval();

    // Handle visibility change - refresh when user comes back to tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Tab became visible, checking for updates...');
        smartRefresh();
      }
    };

    // Handle window focus - refresh when user switches back to window
    const handleWindowFocus = () => {
      console.log('🎯 Window focused, checking for updates...');
      smartRefresh();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    // Cleanup
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [loadBusinessInfo, smartRefresh]);

  // Generate WhatsApp URL with prefilled message
  const generateWhatsAppURL = (gemstone = null, customMessage = null) => {
    const whatsappNumber = businessInfo?.contact?.whatsapp?.replace(/[^\d]/g, '') || '911234567890';
    
    let message;
    if (customMessage) {
      message = customMessage;
    } else if (gemstone) {
      // Create comprehensive gemstone details message
      const formatPrice = (priceRange) => {
        if (!priceRange) return 'Price on request';
        if (priceRange.min && priceRange.max) {
          return `₹${priceRange.min.toLocaleString()} - ₹${priceRange.max.toLocaleString()}`;
        }
        if (priceRange.min) return `₹${priceRange.min.toLocaleString()}+`;
        return 'Price on request';
      };

      const formatWeight = (weight) => {
        if (!weight) return 'N/A';
        return `${weight.value} ${weight.unit || 'carats'}`;
      };

      const formatDimensions = (dimensions) => {
        if (!dimensions) return 'N/A';
        return `${dimensions.length}×${dimensions.width}×${dimensions.height} mm`;
      };

      // Get the main gemstone image
      const imageUrl = gemstone.images && gemstone.images.length > 0 
        ? gemstone.images[0].url 
        : null;

      message = `Hi there!

I saw this beautiful gemstone on your website and I'm really interested in buying it.

${imageUrl ? `Image: ${imageUrl}` : ''}

Name: ${gemstone.name?.english || 'Gemstone'}${gemstone.name?.urdu ? ` (${gemstone.name.urdu})` : ''}
Category: ${gemstone.category || 'Not specified'}
${gemstone.color ? `Color: ${gemstone.color}` : ''}
${gemstone.origin ? `Origin: ${gemstone.origin}` : ''}

${gemstone.weight?.value ? `Weight: ${formatWeight(gemstone.weight)}` : ''}
${gemstone.dimensions ? `Size: ${formatDimensions(gemstone.dimensions)}` : ''}
${gemstone.priceRange ? `Price range: ${formatPrice(gemstone.priceRange)}` : ''}

${gemstone.purpose && gemstone.purpose.length > 0 ? `Purpose: ${gemstone.purpose.join(', ')}` : ''}

${gemstone.certification?.certified ? `Its certified which is great!` : ''}

Full details: ${SITE_CONFIG.BASE_URL}/gemstone/${gemstone.slug || gemstone._id}

Can you please tell me:
- Is it available right now?
- What's the final price?
- How much for shipping?
- Can I see the certificate?

Thanks!`;
    } else {
      message = `Hi!

I'm interested in your gemstone collection. Could you please share:

- What gemstones do you have available?
- Any current offers or deals?
- Can I get expert advice on selecting stones?
- How do you handle shipping?

Thanks!`;
    }

    const encodedMessage = encodeURIComponent(message);
    
    // Enhanced WhatsApp app detection and fallback
    return createWhatsAppLink(whatsappNumber, encodedMessage);
  };

  // Enhanced sharing with image support
  const shareGemstoneWithImage = async (gemstone, customMessage = null) => {
    const imageUrl = gemstone.images && gemstone.images.length > 0 
      ? gemstone.images[0].url 
      : null;

    const shareTitle = `${gemstone.name?.english || 'Beautiful Gemstone'}${gemstone.name?.urdu ? ` (${gemstone.name.urdu})` : ''}`;
    const shareText = customMessage || `Check out this beautiful ${gemstone.category} gemstone from ${businessInfo?.shopName || 'Kohinoor Gemstone'}!`;
    const shareUrl = `${SITE_CONFIG.BASE_URL}/gemstone/${gemstone.slug || gemstone._id}`;

    // Try native Web Share API first (supports images on mobile)
    if (navigator.share && navigator.canShare && imageUrl) {
      try {
        // For mobile devices, try to fetch and share the image
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `${gemstone.name?.english || 'gemstone'}.jpg`, { 
          type: blob.type 
        });

        const canShareWithImage = navigator.canShare({ 
          files: [file], 
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });

        if (canShareWithImage) {
          await navigator.share({
            files: [file],
            title: shareTitle,
            text: shareText,
            url: shareUrl
          });
          return true; // Successfully shared with image
        }
      } catch (error) {
        console.log('Image sharing failed, falling back to text sharing:', error);
      }
    }

    // Fallback to regular WhatsApp sharing with image URL
    return generateWhatsAppURL(gemstone, customMessage);
  };

  // Enhanced WhatsApp link creation with app preference and fallback
  const createWhatsAppLink = (whatsappNumber, encodedMessage) => {
    // Try WhatsApp app first (works on both mobile and desktop if WhatsApp Desktop is installed)
    const appUrl = `whatsapp://send?phone=${whatsappNumber}&text=${encodedMessage}`;
    const webUrl = `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
    
    // For mobile devices, try app first with better detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    // Create a function that tries app first, then falls back to web
    return {
      appUrl,
      webUrl,
      isMobile,
      isIOS,
      isAndroid,
      // Enhanced open function
      open: () => {
        // Try to open WhatsApp app first
        const tryApp = () => {
          if (isMobile) {
            // Mobile: Try app first
            window.location.href = appUrl;
            
            // Fallback to web version after a short delay if app doesn't open
            setTimeout(() => {
              // If we're still on the same page, the app didn't open
              const fallbackToWeb = () => {
                window.open(webUrl, '_blank');
              };
              fallbackToWeb();
            }, 2000);
          } else {
            // Desktop: Try WhatsApp Desktop app first, then web
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = appUrl;
            document.body.appendChild(iframe);
            
            // Quick cleanup and fallback to web
            setTimeout(() => {
              document.body.removeChild(iframe);
              window.open(webUrl, '_blank');
            }, 1000);
          }
        };
        
        tryApp();
      }
    };
  };

  const updateBusinessInfo = async (updates) => {
    try {
      const response = await businessService.updateBusinessInfo(updates);
      setBusinessInfo(prev => ({ ...prev, ...response.data }));
      return response.data;
    } catch (err) {
      throw new Error(err.message || 'Failed to update business info');
    }
  };

  const getCompleteContactInfo = async () => {
    try {
      const response = await businessService.getCompleteContactInfo();
      return response.data;
    } catch (err) {
      throw new Error(err.message || 'Failed to get contact info');
    }
  };

  const updateAllContactInfo = async (contactData) => {
    try {
      const response = await businessService.updateAllContactInfo(contactData);
      
      // Update local state
      setBusinessInfo(prev => ({
        ...prev,
        contact: response.data.contact || prev.contact,
        address: response.data.address || prev.address,
        googleMapsUrl: response.data.googleMapsUrl || prev.googleMapsUrl
      }));
      
      return response.data;
    } catch (err) {
      throw new Error(err.message || 'Failed to update contact info');
    }
  };

  const value = {
    businessInfo,
    loading,
    error,
    darkMode,
    toggleDarkMode,
    loadBusinessInfo,
    updateBusinessInfo,
    getCompleteContactInfo,
    updateAllContactInfo,
    generateWhatsAppURL,
    shareGemstoneWithImage,
    lastUpdated, // Expose lastUpdated for display
    forceRefresh // Expose forceRefresh for manual updates
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}; 