import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  X, ShoppingCart, Trash2, Plus, Minus, 
  MessageCircle, ShoppingBag, Gem, ArrowRight 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const CartDrawer = () => {
  const { 
    cartItems, 
    cartCount, 
    isCartOpen, 
    closeCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal,
    buyNowWithWhatsApp 
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const total = getCartTotal();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
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
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-luxury-gold/10 to-transparent">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-luxury-gold" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">Your Cart</h2>
                  <p className="text-xs text-gray-500">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {!isAuthenticated ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-luxury-gold/10 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-luxury-gold" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Login Required</h3>
                  <p className="text-gray-500 text-sm mb-4">Please login to use the cart feature</p>
                  <button
                    onClick={closeCart}
                    className="px-6 py-2 bg-luxury-gold text-white rounded-full text-sm font-medium hover:bg-luxury-gold/90 transition-colors"
                  >
                    Login to Continue
                  </button>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 text-sm mb-4">Add some beautiful gemstones!</p>
                  <Link
                    to="/gemstones"
                    onClick={closeCart}
                    className="px-6 py-2 bg-luxury-gold text-white rounded-full text-sm font-medium hover:bg-luxury-gold/90 transition-colors flex items-center"
                  >
                    Browse Gemstones
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                    >
                      {/* Image */}
                      <Link 
                        to={`/gemstone/${item.slug || item._id}`}
                        onClick={closeCart}
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
                          onClick={closeCart}
                          className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1 hover:text-luxury-gold transition-colors"
                        >
                          {item.name?.english || item.name}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                        {item.ratti && (
                          <p className="text-xs text-luxury-gold mt-0.5">{item.ratti} Ratti</p>
                        )}
                        
                        {/* Price */}
                        {(item.price || item.priceRange?.min) && (
                          <p className="text-sm font-semibold text-emerald-600 mt-1">
                            ₹{(item.price || item.priceRange?.min).toLocaleString('en-IN')}
                          </p>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2 bg-white dark:bg-gray-700 rounded-full p-1">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Clear Cart */}
                  {cartItems.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="w-full py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {isAuthenticated && cartItems.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {/* Total */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total ({cartCount} items):</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {total > 0 ? `₹${total.toLocaleString('en-IN')}` : 'Contact for price'}
                  </span>
                </div>

                {/* Secure Online Checkout */}
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/checkout');
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-neutral-900 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all shadow-md shadow-amber-500/10 mb-2"
                >
                  <ShoppingBag className="w-4.5 h-4.5" />
                  <span>Secure Online Checkout</span>
                </button>

                {/* Buy Now via WhatsApp */}
                <button
                  onClick={buyNowWithWhatsApp}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order / Inquire via WhatsApp</span>
                </button>

                <p className="text-xs text-center text-gray-500 mt-3">
                  🛒 Your order will be sent to admin on WhatsApp
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
