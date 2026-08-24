import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

const WISHLIST_STORAGE_KEY = 'kohinoor_wishlist';

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        setWishlistItems(parsedWishlist);
      }
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
      } catch (error) {
        console.error('Error saving wishlist to localStorage:', error);
      }
    }
  }, [wishlistItems, isLoading]);

  // Add item to wishlist
  const addToWishlist = (gemstone) => {
    if (!gemstone || !gemstone._id) return;

    setWishlistItems(prev => {
      // Check if item already exists
      if (prev.some(item => item._id === gemstone._id)) {
        return prev;
      }

      // Create wishlist item with essential data
      const wishlistItem = {
        _id: gemstone._id,
        name: gemstone.name,
        category: gemstone.category,
        images: gemstone.images || [],
        priceRange: gemstone.priceRange,
        summary: gemstone.summary,
        addedAt: new Date().toISOString(),
        viewCount: gemstone.viewCount || 0,
        isTrending: gemstone.isTrending || false
      };

      return [...prev, wishlistItem];
    });
  };

  // Remove item from wishlist
  const removeFromWishlist = (gemstoneId) => {
    setWishlistItems(prev => prev.filter(item => item._id !== gemstoneId));
  };

  // Toggle item in wishlist
  const toggleWishlist = (gemstone) => {
    if (!gemstone || !gemstone._id) return;

    const isInWishlist = wishlistItems.some(item => item._id === gemstone._id);
    
    if (isInWishlist) {
      removeFromWishlist(gemstone._id);
    } else {
      addToWishlist(gemstone);
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (gemstoneId) => {
    return wishlistItems.some(item => item._id === gemstoneId);
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    setWishlistItems([]);
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  // Get wishlist items sorted by date added (newest first)
  const getSortedWishlistItems = () => {
    return [...wishlistItems].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
  };

  const value = {
    wishlistItems: getSortedWishlistItems(),
    isLoading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}; 