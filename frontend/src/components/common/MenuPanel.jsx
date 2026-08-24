import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  User, LogOut, Heart, ShoppingCart, MessageCircle, Phone, Mail,
  Home, Gem, Info, Moon, Sun, ChevronRight, X, UserCircle, Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useBusinessContext } from '../../context/BusinessContext';
import { useGlobalToast } from '../../context/ToastContext';
import SlidePanel from './SlidePanel';

const MenuPanel = ({ isOpen, onClose, onChatClick, onCartClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getWishlistCount } = useWishlist();
  const { cartCount } = useCart();
  const { businessInfo, darkMode, toggleDarkMode } = useBusinessContext();
  const toast = useGlobalToast();

  const wishlistCount = getWishlistCount();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'All Gemstones', href: '/gemstones', icon: Gem },
    { name: 'Our Story & Contact', href: '/about', icon: Info }
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    toast.logoutSuccess();
    onClose();
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      showHeader={false}
    >
      <div className="flex flex-col h-full">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <span className="text-lg font-semibold text-neutral-900 dark:text-white">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* User Profile Section */}
          {isAuthenticated && user ? (
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-amber-500/30"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 
                    flex items-center justify-center text-white text-xl font-bold ring-2 ring-amber-500/30">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-neutral-900 dark:text-white truncate">{user.name}</h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
                  {user.isEmailVerified && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
              <Link
                to="/signin"
                onClick={handleLinkClick}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 
                  text-white rounded-xl font-medium shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all"
              >
                <User className="w-5 h-5" />
                <span>Sign In / Create Account</span>
              </Link>
            </div>
          )}

          {/* Quick Actions */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Wishlist */}
              <Link
                to="/wishlist"
                onClick={handleLinkClick}
                className="flex flex-col items-center gap-2 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="relative">
                  <Heart className="w-6 h-6 text-rose-500" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Wishlist</span>
              </Link>

              {/* Cart */}
              <button
                onClick={() => {
                  onClose();
                  onCartClick?.();
                }}
                className="flex flex-col items-center gap-2 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="relative">
                  <ShoppingCart className="w-6 h-6 text-emerald-500" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Cart</span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Navigation</p>
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={handleLinkClick}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-neutral-700 dark:text-neutral-200
                      hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-neutral-500 group-hover:text-amber-500 transition-colors" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Profile & Chat (Authenticated) */}
          {isAuthenticated && (
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Account</p>
              <div className="space-y-1">
                <Link
                  to="/profile"
                  onClick={handleLinkClick}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-neutral-700 dark:text-neutral-200
                    hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <UserCircle className="w-5 h-5 text-neutral-500 group-hover:text-amber-500 transition-colors" />
                    <span className="font-medium">My Profile</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </Link>

                <button
                  onClick={() => {
                    onClose();
                    onChatClick?.();
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-amber-600 dark:text-amber-400
                    hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">Let's Talk</span>
                  </div>
                  <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">Chat</span>
                </button>
              </div>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-indigo-500" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <span className="font-medium text-neutral-700 dark:text-neutral-200">
                  {darkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              {/* Toggle Switch */}
              <div className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-neutral-300'}`}>
                <motion.div
                  animate={{ x: darkMode ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                />
              </div>
            </button>
          </div>

          {/* Quick Contact */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Quick Contact</p>
            <div className="space-y-2">
              {businessInfo?.contact?.phone && (
                <a
                  href={`tel:${businessInfo.contact.phone}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span className="font-medium">{businessInfo.contact.phone}</span>
                </a>
              )}
              {businessInfo?.contact?.email && (
                <a
                  href={`mailto:${businessInfo.contact.email}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span className="font-medium text-sm truncate">{businessInfo.contact.email}</span>
                </a>
              )}
            </div>
          </div>

          {/* Logout (Authenticated) */}
          {isAuthenticated && (
            <div className="p-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 
                  text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </SlidePanel>
  );
};

export default MenuPanel;
