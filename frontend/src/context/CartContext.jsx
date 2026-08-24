import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useBusinessContext } from './BusinessContext';
import { SITE_CONFIG } from '../config/config';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const CART_STORAGE_KEY = 'kohinoor_cart';

export const CartProvider = ({ children }) => {
  const { isAuthenticated, customer } = useAuth();
  const { businessInfo } = useBusinessContext();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Get storage key based on user
  const getStorageKey = () => {
    if (isAuthenticated && customer?._id) {
      return `${CART_STORAGE_KEY}_${customer._id}`;
    }
    return CART_STORAGE_KEY;
  };

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(getStorageKey());
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      localStorage.removeItem(getStorageKey());
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, customer]);

  // Save cart to localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    }
  }, [cartItems, isLoading]);

  // Add to cart
  const addToCart = (gemstone, quantity = 1) => {
    if (!gemstone || !gemstone._id) return false;
    
    // Only allow for logged-in users
    if (!isAuthenticated) {
      return { success: false, message: 'Please login to add items to cart' };
    }

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item._id === gemstone._id);
      
      if (existingIndex > -1) {
        // Update quantity
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      // Add new item
      const cartItem = {
        _id: gemstone._id,
        name: gemstone.name,
        category: gemstone.category,
        images: gemstone.images || [],
        priceRange: gemstone.priceRange,
        price: gemstone.price,
        ratti: gemstone.ratti,
        color: gemstone.color,
        slug: gemstone.slug,
        quantity: quantity,
        addedAt: new Date().toISOString()
      };

      return [...prev, cartItem];
    });

    return { success: true, message: 'Added to cart!' };
  };

  // Remove from cart
  const removeFromCart = (gemstoneId) => {
    setCartItems(prev => prev.filter(item => item._id !== gemstoneId));
  };

  // Update quantity
  const updateQuantity = (gemstoneId, quantity) => {
    if (quantity < 1) {
      removeFromCart(gemstoneId);
      return;
    }
    
    setCartItems(prev => prev.map(item => 
      item._id === gemstoneId ? { ...item, quantity } : item
    ));
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Get cart count
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Get cart total (estimated)
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || item.priceRange?.min || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  // Check if item is in cart
  const isInCart = (gemstoneId) => {
    return cartItems.some(item => item._id === gemstoneId);
  };

  // Get item quantity in cart
  const getItemQuantity = (gemstoneId) => {
    const item = cartItems.find(item => item._id === gemstoneId);
    return item ? item.quantity : 0;
  };

  // Generate WhatsApp message for cart
  const generateCartWhatsAppMessage = () => {
    if (cartItems.length === 0) return '';

    const baseUrl = SITE_CONFIG.BASE_URL;
    
    let message = `🛒 *Order Request - Kohinoor Gemstone*\n\n`;
    message += `👤 *Customer:* ${customer?.name || 'Guest'}\n`;
    if (customer?.email) message += `📧 *Email:* ${customer.email}\n`;
    if (customer?.phone) message += `📱 *Phone:* ${customer.phone}\n`;
    message += `\n${'─'.repeat(30)}\n`;
    message += `📦 *Items in Cart (${cartCount}):*\n`;

    cartItems.forEach((item, index) => {
      const price = item.price || item.priceRange?.min;
      const maxPrice = item.priceRange?.max;
      const gemstoneUrl = `${baseUrl}/gemstone/${item.slug || item._id}`;
      
      message += `\n*${index + 1}. ${item.name?.english || item.name}*`;
      if (item.name?.urdu) message += ` (${item.name.urdu})`;
      message += `\n`;
      message += `   📂 Category: ${item.category}\n`;
      if (item.color) message += `   🎨 Color: ${item.color}\n`;
      if (item.weight?.value) message += `   ⚖️ Weight: ${item.weight.value} ${item.weight.unit || 'carats'}\n`;
      if (item.ratti) message += `   ⚖️ Weight: ${item.ratti} Ratti\n`;
      if (item.dimensions) {
        message += `   📐 Size: ${item.dimensions.length}×${item.dimensions.width}×${item.dimensions.height}mm\n`;
      }
      if (item.certification?.certified) message += `   ✅ Certified\n`;
      message += `   🔢 Qty: ${item.quantity}\n`;
      if (price && maxPrice && price !== maxPrice) {
        message += `   💰 Price: ₹${price.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}\n`;
      } else if (price) {
        message += `   💰 Price: ₹${price.toLocaleString('en-IN')}\n`;
      }
      message += `   🔗 ${gemstoneUrl}\n`;
    });

    message += `\n${'─'.repeat(30)}\n`;
    
    const total = getCartTotal();
    if (total > 0) {
      message += `💎 *Estimated Total:* ₹${total.toLocaleString('en-IN')}\n`;
    }
    
    message += `\n📝 *Please confirm:*\n`;
    message += `• Availability of items\n`;
    message += `• Final pricing\n`;
    message += `• Shipping charges\n`;
    message += `\n🙏 Thank you!`;

    return message;
  };

  // Open WhatsApp with cart
  const buyNowWithWhatsApp = () => {
    if (cartItems.length === 0) return;

    const whatsappNumber = businessInfo?.contact?.whatsapp || '919876543210';
    const cleanNumber = whatsappNumber.replace(/[^\d]/g, '');
    const message = encodeURIComponent(generateCartWhatsAppMessage());
    
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // Toggle cart drawer
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const value = {
    cartItems,
    cartCount,
    isLoading,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    getCartTotal,
    buyNowWithWhatsApp,
    openCart,
    closeCart,
    toggleCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
