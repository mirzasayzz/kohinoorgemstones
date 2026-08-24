import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  AlertTriangle,
  RefreshCw,
  Heart,
  ShoppingCart,
  LogIn,
  LogOut,
  UserPlus,
  Sparkles
} from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose,
  persistent = false,
  showIcon = true,
  actionButton = null,
  emoji = null
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose, persistent]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/90 text-white shadow-emerald-500/25';
      case 'error':
        return 'bg-red-500/90 text-white shadow-red-500/25';
      case 'warning':
        return 'bg-amber-500/90 text-white shadow-amber-500/25';
      case 'info':
        return 'bg-blue-500/90 text-white shadow-blue-500/25';
      case 'update':
        return 'bg-purple-500/90 text-white shadow-purple-500/25';
      case 'wishlist':
        return 'bg-pink-500/90 text-white shadow-pink-500/25';
      case 'wishlist-remove':
        return 'bg-gray-700/90 text-white shadow-gray-500/25';
      case 'cart':
        return 'bg-amber-500/90 text-white shadow-amber-500/25';
      case 'login':
        return 'bg-emerald-500/90 text-white shadow-emerald-500/25';
      case 'logout':
        return 'bg-gray-700/90 text-white shadow-gray-500/25';
      case 'signup':
        return 'bg-violet-500/90 text-white shadow-violet-500/25';
      default:
        return 'bg-gray-800/90 text-white shadow-gray-500/25';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'update':
        return <RefreshCw className="w-5 h-5" />;
      case 'wishlist':
        return <Heart className="w-5 h-5 fill-current" />;
      case 'wishlist-remove':
        return <Heart className="w-5 h-5" />;
      case 'cart':
        return <ShoppingCart className="w-5 h-5" />;
      case 'login':
        return <LogIn className="w-5 h-5" />;
      case 'logout':
        return <LogOut className="w-5 h-5" />;
      case 'signup':
        return <UserPlus className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={`
            max-w-xs w-full rounded-2xl shadow-2xl backdrop-blur-xl
            border border-white/20 overflow-hidden
            ${getToastStyles()}
          `}
        >
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              {showIcon && (
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="flex-shrink-0"
                >
                  {emoji ? (
                    <span className="text-xl">{emoji}</span>
                  ) : (
                    getIcon()
                  )}
                </motion.div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-5">
                  {message}
                </p>
              </div>
              
              {actionButton && (
                <div className="flex-shrink-0">
                  {actionButton}
                </div>
              )}
              
              {!persistent && (
                <button
                  onClick={handleClose}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Sleek progress bar */}
          {!persistent && duration > 0 && (
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              style={{ transformOrigin: "left" }}
              className="h-0.5 bg-white/40"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast Manager Component
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Toast Hook for easy usage
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showToast = (message, type = 'info', options = {}) => {
    return addToast({
      message,
      type,
      ...options
    });
  };

  // Basic toasts
  const showSuccess = (message, options = {}) => showToast(message, 'success', options);
  const showError = (message, options = {}) => showToast(message, 'error', options);
  const showWarning = (message, options = {}) => showToast(message, 'warning', options);
  const showInfo = (message, options = {}) => showToast(message, 'info', options);
  const showUpdate = (message, options = {}) => showToast(message, 'update', options);

  // Wishlist toasts
  const showWishlistAdd = (gemstone) => showToast(
    `${gemstone?.name?.english || 'Item'} added to wishlist`,
    'wishlist',
    { emoji: '💖' }
  );
  const showWishlistRemove = (gemstone) => showToast(
    `${gemstone?.name?.english || 'Item'} removed from wishlist`,
    'wishlist-remove',
    { emoji: '💔' }
  );

  // Cart toasts
  const showCartAdd = (gemstone) => showToast(
    `${gemstone?.name?.english || 'Item'} added to cart`,
    'cart',
    { emoji: '🛒' }
  );
  const showCartRemove = (gemstone) => showToast(
    `${gemstone?.name?.english || 'Item'} removed from cart`,
    'cart',
    { emoji: '🗑️' }
  );

  // Auth toasts
  const showLogin = (name) => showToast(
    `Welcome back${name ? `, ${name}` : ''}!`,
    'login',
    { emoji: '✨' }
  );
  const showLogout = () => showToast(
    'See you soon! Take care',
    'logout',
    { emoji: '👋' }
  );
  const showSignup = (name) => showToast(
    `Welcome to Kohinoor${name ? `, ${name}` : ''}! 🎉`,
    'signup',
    { emoji: '🎉' }
  );

  return {
    toasts,
    addToast,
    removeToast,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showUpdate,
    showWishlistAdd,
    showWishlistRemove,
    showCartAdd,
    showCartRemove,
    showLogin,
    showLogout,
    showSignup,
    ToastContainer: () => <ToastContainer toasts={toasts} removeToast={removeToast} />
  };
};

export default Toast; 