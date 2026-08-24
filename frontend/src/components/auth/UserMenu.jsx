import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  User, LogOut, ChevronDown, 
  UserCircle, Loader2, MessageCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserMenu = ({ onLoginClick, onChatClick }) => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="p-2">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
      </div>
    );
  }

  // Not authenticated - show login button (icon only on mobile)
  if (!isAuthenticated) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onLoginClick}
        className="flex items-center justify-center gap-1 p-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-amber-500 to-amber-600 
          text-white rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm shadow-md shadow-amber-500/20
          hover:from-amber-600 hover:to-amber-700 transition-all"
      >
        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Sign In</span>
      </motion.button>
    );
  }

  // Authenticated - show profile menu
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile button - compact on mobile */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 sm:pr-3 bg-neutral-100 dark:bg-neutral-800 
          rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        {/* Avatar */}
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 
            flex items-center justify-center text-white text-xs sm:text-sm font-bold">
            {getInitials(user.name)}
          </div>
        )}
        
        {/* Name (desktop only) */}
        <span className="hidden sm:block text-sm font-medium text-neutral-700 dark:text-neutral-200 max-w-[80px] truncate">
          {user.name.split(' ')[0]}
        </span>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="hidden sm:block"
        >
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        </motion.div>
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl 
              border border-neutral-200 dark:border-neutral-800 overflow-hidden z-50"
          >
            {/* User info header */}
            <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 
              border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/30"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 
                    flex items-center justify-center text-white text-lg font-bold ring-2 ring-amber-500/30">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-neutral-800 dark:text-white truncate">{user.name}</h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
                </div>
              </div>
              
              {/* Verified badge */}
              {user.isEmailVerified && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-2 py-0.5 rounded-full">
                    ✓ Verified Account
                  </span>
                </div>
              )}
            </div>

            {/* Menu items */}
            <div className="p-2">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-700 dark:text-neutral-200
                  hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <UserCircle className="w-5 h-5 text-neutral-500" />
                <span className="text-sm font-medium">My Profile</span>
              </Link>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  onChatClick?.();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-amber-700 dark:text-amber-300
                  hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium">Let's Talk</span>
              </button>
              
              <div className="my-2 border-t border-neutral-200 dark:border-neutral-800" />
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400
                  hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
