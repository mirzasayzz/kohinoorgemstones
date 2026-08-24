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
  const onBusinessUpdateRef = useRef(onBusinessUpdate);

  useEffect(() => {
    onBusinessUpdateRef.current = onBusinessUpdate;
  }, [onBusinessUpdate]);

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
      const response = await businessService.getBusinessInfo();
      const serverUpdatedAt = response?.data?.businessInfo?.updatedAt;
      if (!serverUpdatedAt) return false;
      if (!lastUpdatedAtRef.current || new Date(serverUpdatedAt) > new Date(lastUpdatedAtRef.current)) {
        if (import.meta.env.DEV) console.log('🔄 Business data updated, refreshing...');
        return true;
      }
      return false;
    } catch (err) {
      if (import.meta.env.DEV) console.error('Failed to check for updates:', err);
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
      const [businessResponse, contactResponse] = await Promise.all([
        businessService.getBusinessInfo(),
        businessService.getCompleteContactInfo()
      ]);
      const serverUpdatedAt = businessResponse?.data?.businessInfo?.updatedAt;
      const wasUpdated = serverUpdatedAt && lastUpdatedAtRef.current && new Date(serverUpdatedAt) > new Date(lastUpdatedAtRef.current);
      if (serverUpdatedAt) {
        lastUpdatedAtRef.current = serverUpdatedAt;
        setLastUpdated(serverUpdatedAt);
      }
      const backendBusiness = businessResponse?.data?.businessInfo || {};
      const completeContact = contactResponse?.data?.contact || {};
      const mergedBusinessInfo = {
        ...backendBusiness,
        contact: {
          ...backendBusiness.contact,
          whatsapp: completeContact.whatsapp ?? backendBusiness.contact?.whatsapp,
          phone: completeContact.phone ?? backendBusiness.contact?.phone,
          email: completeContact.email ?? backendBusiness.contact?.email
        },
        address: completeContact.address || backendBusiness.address || {},
        googleMapsUrl: completeContact.googleMapsUrl ?? backendBusiness.googleMapsUrl
      };
      setBusinessInfo(mergedBusinessInfo);
      if (import.meta.env.DEV) console.log('✅ Business info loaded successfully');
      if (hasInitiallyLoadedRef.current && wasUpdated && showNotification && onBusinessUpdateRef.current) {
        onBusinessUpdateRef.current(mergedBusinessInfo, {
          type: 'auto-update',
          message: 'Business information updated automatically! 🔄'
        });
      }
      hasInitiallyLoadedRef.current = true;
    } catch (err) {
      if (import.meta.env.DEV) console.error('Failed to load business info:', err);
      setError(err.message || 'Failed to load business information');
      setBusinessInfo(null);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const smartRefresh = useCallback(async () => {
    const hasUpdates = await checkForUpdates();
    if (hasUpdates) {
      await loadBusinessInfo(false, true);
    }
  }, [checkForUpdates, loadBusinessInfo]);

  // Setup initial load only (no periodic or visibility/focus refresh)
  useEffect(() => {
    loadBusinessInfo(true, false);
    // No timers or listeners to reduce resource usage
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [loadBusinessInfo]);

  const generateWhatsAppURL = (gemstone = null, customMessage = null) => {
    const whatsappNumber = businessInfo?.contact?.whatsapp?.replace(/[^\d]/g, '') || '911234567890';
    let message;
    if (customMessage) {
      message = customMessage;
    } else if (gemstone) {
      const formatPrice = (priceRange) => {
        if (!priceRange) return 'Price on request';
        if (priceRange.min && priceRange.max) return `₹${priceRange.min.toLocaleString()} - ₹${priceRange.max.toLocaleString()}`;
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
      const imageUrl = gemstone.images && gemstone.images.length > 0 ? gemstone.images[0].url : null;
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
    return createWhatsAppLink(whatsappNumber, encodedMessage);
  };

  const shareGemstoneWithImage = async (gemstone, customMessage = null) => {
    const imageUrl = gemstone.images && gemstone.images.length > 0 ? gemstone.images[0].url : null;
    const shareTitle = `${gemstone.name?.english || 'Beautiful Gemstone'}${gemstone.name?.urdu ? ` (${gemstone.name.urdu})` : ''}`;
    const shareText = customMessage || `Check out this beautiful ${gemstone.category}${businessInfo?.shopName ? ` from ${businessInfo.shopName}` : ''}!`;
    const shareUrl = `${SITE_CONFIG.BASE_URL}/gemstone/${gemstone.slug || gemstone._id}`;
    if (navigator.share && navigator.canShare && imageUrl) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `${gemstone.name?.english || 'gemstone'}.jpg`, { type: blob.type });
        const canShareWithImage = navigator.canShare({ files: [file], title: shareTitle, text: shareText, url: shareUrl });
        if (canShareWithImage) {
          await navigator.share({ files: [file], title: shareTitle, text: shareText, url: shareUrl });
          return true;
        }
      } catch (error) {
        if (import.meta.env.DEV) console.log('Image sharing failed, falling back to text sharing:', error);
      }
    }
    return generateWhatsAppURL(gemstone, customMessage);
  };

  const createWhatsAppLink = (whatsappNumber, encodedMessage) => {
    const appUrl = `whatsapp://send?phone=${whatsappNumber}&text=${encodedMessage}`;
    const webUrl = `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    return { appUrl, webUrl, isMobile, isIOS, isAndroid, open: () => {
      const tryApp = () => {
        if (isMobile) {
          window.location.href = appUrl;
          setTimeout(() => { window.open(webUrl, '_blank'); }, 2000);
        } else {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = appUrl;
          document.body.appendChild(iframe);
          setTimeout(() => { document.body.removeChild(iframe); window.open(webUrl, '_blank'); }, 1000);
        }
      };
      tryApp();
    }};
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
    lastUpdated,
    forceRefresh: () => loadBusinessInfo(true, false)
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}; 