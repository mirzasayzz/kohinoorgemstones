import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  X, Heart, Trash2, ShoppingCart,
  MessageCircle, Gem, ArrowRight 
} from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useBusinessContext } from '../../context/BusinessContext';

const WishlistDrawer = () => {
  const { 
    wishlistItems, 
    wishlistCount,
    isWishlistOpen, 
    closeWishlist, 
    removeFromWishlist,
    clearWishlist
  } = useWishlist();
  
  const { addToCart } = useCart();
  const { generateWhatsAppURL } = useBusinessContext();

  const handleAddToCart = (item) => {
    addToCart(item);
    removeFromWishlist(item._id);
  };

  const handleWhatsAppInquiry = (item) => {
    const message = `Hi! I'm interested in this gemstone from my wishlist:\n\n💎 ${item.name?.english || item.name}\n📦 Category: ${item.category}\n\nPlease share more details and availability.`;
    const url = generateWhatsAppURL(message);
    window.open(url, '_blank');
  };

  // Calculate total price
  const totalPrice = wishlistItems.reduce((total, item) => {
    const price = item.price || item.priceRange?.min || 0;
    return total + price;
  }, 0);

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWishlist}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-red-500/10 to-pink-500/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">Your Wishlist</h2>
                  <p className="text-xs text-gray-500">{wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved</p>
                </div>
              </div>
              <button
                onClick={closeWishlist}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wishlist Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {wishlistItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-500 text-sm mb-4">Save gemstones you love!</p>
                  <Link
                    to="/gemstones"
                    onClick={closeWishlist}
                    className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity flex items-center"
                  >
                    Browse Gemstones
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlistItems.map((item, index) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                    >
                      {/* Image */}
                      <Link 
                        to={`/gemstone/${item.slug || item._id}`}
                        onClick={closeWishlist}
                        className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700"
                      >
                        {item.images?.[0]?.url ? (
                          <img 
                            src={item.images[0].url} 
                            alt={item.name?.english || item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Gem className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/gemstone/${item.slug || item._id}`}
                          onClick={closeWishlist}
                          className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1 hover:text-red-500 transition-colors"
                        >
                          {item.name?.english || item.name}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                        
                        {/* Price */}
                        {(item.price || item.priceRange?.min) && (
                          <p className="text-sm font-semibold text-emerald-600 mt-1">
                            ₹{(item.price || item.priceRange?.min).toLocaleString('en-IN')}
                            {item.priceRange?.max && item.priceRange.max !== item.priceRange.min && (
                              <span className="text-gray-400 font-normal"> - ₹{item.priceRange.max.toLocaleString('en-IN')}</span>
                            )}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="flex-1 py-1.5 px-2 bg-luxury-gold/10 hover:bg-luxury-gold/20 text-luxury-gold rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            Add to Cart
                          </button>
                          <button
                            onClick={() => handleWhatsAppInquiry(item)}
                            className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-600 rounded-lg transition-colors"
                            title="Inquire on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromWishlist(item._id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Clear Wishlist */}
                  {wishlistItems.length > 0 && (
                    <button
                      onClick={clearWishlist}
                      className="w-full py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                      Clear Wishlist
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {wishlistItems.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {/* Total Price */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Total Value:</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {totalPrice > 0 ? `₹${totalPrice.toLocaleString('en-IN')}` : 'Contact for price'}
                  </span>
                </div>

                <Link
                  to="/gemstones"
                  onClick={closeWishlist}
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-red-500/30"
                >
                  <Gem className="w-5 h-5" />
                  <span>Continue Shopping</span>
                </Link>

                <p className="text-xs text-center text-gray-500 mt-3">
                  ❤️ {wishlistCount} items saved for later
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WishlistDrawer;
