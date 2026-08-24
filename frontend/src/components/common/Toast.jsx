import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Check } from 'lucide-react';

let toastId = 0;

const Toast = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'wishlist-add':
        return <Heart className="w-5 h-5 text-red-500 fill-current" />;
      case 'wishlist-remove':
        return <Heart className="w-5 h-5 text-gray-500" />;
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />;
      default:
        return <Heart className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'wishlist-add':
        return 'bg-red-50 border-red-200';
      case 'wishlist-remove':
        return 'bg-gray-50 border-gray-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      className={`
        ${getBgColor()}
        rounded-lg shadow-lg border p-4 max-w-sm w-full
        backdrop-blur-sm
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-sm text-gray-500 mt-1">
              {toast.message}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => onRemove(toast.id)}
            className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Toast context and hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ type = 'info', title, message, duration = 3000 }) => {
    const id = ++toastId;
    const toast = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, toast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showWishlistAdd = (gemstone) => {
    addToast({
      type: 'wishlist-add',
      title: 'Added to Wishlist',
      message: `${gemstone?.name?.english} saved to your wishlist`
    });
  };

  const showWishlistRemove = (gemstone) => {
    addToast({
      type: 'wishlist-remove',
      title: 'Removed from Wishlist',
      message: `${gemstone?.name?.english} removed from your wishlist`
    });
  };

  return {
    toasts,
    addToast,
    removeToast,
    showWishlistAdd,
    showWishlistRemove,
    ToastContainer: () => <ToastContainer toasts={toasts} onRemove={removeToast} />
  };
};

export default Toast; 