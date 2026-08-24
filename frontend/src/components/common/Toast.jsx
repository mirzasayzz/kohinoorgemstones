import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose,
  persistent = false,
  showIcon = true,
  actionButton = null
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose, persistent]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 shadow-green-100';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 shadow-red-100';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 shadow-yellow-100';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100';
      case 'update':
        return 'bg-purple-50 border-purple-200 text-purple-800 shadow-purple-100';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 shadow-gray-100';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'update':
        return <RefreshCw className="w-5 h-5 text-purple-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
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
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`
            fixed top-4 right-4 z-50 max-w-sm w-full
            border rounded-lg shadow-lg backdrop-blur-sm
            ${getToastStyles()}
          `}
        >
          <div className="p-4">
            <div className="flex items-start space-x-3">
              {showIcon && (
                <div className="flex-shrink-0">
                  {getIcon()}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-5">
                  {message}
                </p>
              </div>
              
              {actionButton && (
                <div className="flex-shrink-0 ml-2">
                  {actionButton}
                </div>
              )}
              
              {!persistent && (
                <div className="flex-shrink-0 ml-2">
                  <button
                    onClick={handleClose}
                    className="inline-flex rounded-md p-1.5 hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-gray-600 transition-colors"
                  >
                    <span className="sr-only">Dismiss</span>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Progress bar for timed toasts */}
          {!persistent && duration > 0 && (
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              className="h-1 bg-current opacity-20 rounded-b-lg"
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

  const showSuccess = (message, options = {}) => showToast(message, 'success', options);
  const showError = (message, options = {}) => showToast(message, 'error', options);
  const showWarning = (message, options = {}) => showToast(message, 'warning', options);
  const showInfo = (message, options = {}) => showToast(message, 'info', options);
  const showUpdate = (message, options = {}) => showToast(message, 'update', options);

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
    ToastContainer: () => <ToastContainer toasts={toasts} removeToast={removeToast} />
  };
};

export default Toast; 