import { createContext, useContext, useState, useCallback } from 'react';
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

const ToastContext = createContext(null);

export const useGlobalToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useGlobalToast must be used within a ToastProvider');
  }
  return context;
};

// Single Toast Component - Simple, solid colors, no emoji
const Toast = ({ toast, onRemove }) => {
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
      case 'login':
        return 'bg-emerald-700';
      case 'error':
        return 'bg-red-700';
      case 'warning':
      case 'cart':
        return 'bg-amber-700';
      case 'info':
        return 'bg-blue-700';
      case 'wishlist':
        return 'bg-pink-700';
      case 'wishlist-remove':
      case 'logout':
        return 'bg-neutral-800';
      case 'signup':
        return 'bg-violet-700';
      default:
        return 'bg-neutral-800';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'wishlist':
        return <Heart className="w-5 h-5 fill-current" />;
      case 'wishlist-remove':
        return <Heart className="w-5 h-5" />;
      case 'cart':
        return <ShoppingCart className="w-5 h-5" />;
      case 'login':
        return <Sparkles className="w-5 h-5" />;
      case 'logout':
        return <LogOut className="w-5 h-5" />;
      case 'signup':
        return <UserPlus className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const duration = toast.duration || 3000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`w-full max-w-sm rounded-xl shadow-xl text-white overflow-hidden ${getToastStyles()}`}
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        style={{ transformOrigin: "left" }}
        className="h-1 bg-white/30"
      />
    </motion.div>
  );
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    const duration = toast.duration || 3000;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'info', options = {}) => {
    return addToast({ message, type, ...options });
  }, [addToast]);

  // Helper functions
  const success = (message, options) => toast(message, 'success', options);
  const error = (message, options) => toast(message, 'error', options);
  const warning = (message, options) => toast(message, 'warning', options);
  const info = (message, options) => toast(message, 'info', options);

  // Wishlist
  const wishlistAdd = (gemstone) => toast(
    `${gemstone?.name?.english || 'Item'} added to wishlist`,
    'wishlist'
  );
  const wishlistRemove = (gemstone) => toast(
    `${gemstone?.name?.english || 'Item'} removed from wishlist`,
    'wishlist-remove'
  );

  // Cart
  const cartAdd = (gemstone) => toast(
    `${gemstone?.name?.english || 'Item'} added to cart`,
    'cart'
  );
  const cartRemove = (gemstone) => toast(
    `${gemstone?.name?.english || 'Item'} removed from cart`,
    'cart'
  );

  // Auth
  const loginSuccess = (name) => toast(
    `Welcome back${name ? `, ${name}` : ''}!`,
    'login'
  );
  const logoutSuccess = () => toast(
    'See you soon!',
    'logout'
  );
  const signupSuccess = (name) => toast(
    `Welcome to Kohinoor${name ? `, ${name}` : ''}!`,
    'signup'
  );

  const value = {
    toast,
    success,
    error,
    warning,
    info,
    wishlistAdd,
    wishlistRemove,
    cartAdd,
    cartRemove,
    loginSuccess,
    logoutSuccess,
    signupSuccess
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <Toast toast={t} onRemove={removeToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
