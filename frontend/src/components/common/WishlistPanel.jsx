import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, X, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import SlidePanel from './SlidePanel';

const WishlistPanel = ({ isOpen, onClose }) => {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const [removingId, setRemovingId] = useState(null);

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    await removeFromWishlist(productId);
    setRemovingId(null);
  };

  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
    await removeFromWishlist(product._id);
  };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title=""
      showHeader={false}
    >
      {/* Custom Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">My Wishlist</h2>
              <p className="text-red-100 text-xs">{wishlistItems.length} items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Heart className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
            <p className="font-medium text-neutral-600 dark:text-neutral-400">Your wishlist is empty</p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Save items you love for later</p>
            <Link
              to="/gemstones"
              onClick={onClose}
              className="inline-block mt-4 px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all"
            >
              Explore Gemstones
            </Link>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {wishlistItems.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-neutral-900 rounded-xl p-3 shadow-sm"
              >
                <div className="flex gap-3">
                  {/* Product Image */}
                  <Link
                    to={`/gemstone/${item._id}`}
                    onClick={onClose}
                    className="shrink-0"
                  >
                    <img
                      src={item.image || '/api/placeholder/80/80'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/gemstone/${item._id}`}
                      onClick={onClose}
                      className="text-sm font-medium text-neutral-900 dark:text-white hover:text-amber-600 line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    
                    {item.weight && (
                      <p className="text-xs text-neutral-500 mt-1">{item.weight} carats</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-amber-600 font-semibold">
                        ₹{item.price?.toLocaleString('en-IN')}
                      </span>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-200 dark:hover:bg-amber-900/30 transition-colors"
                          title="Add to cart"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(item._id)}
                          disabled={removingId === item._id}
                          className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                          title="Remove"
                        >
                          {removingId === item._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </SlidePanel>
  );
};

export default WishlistPanel;
