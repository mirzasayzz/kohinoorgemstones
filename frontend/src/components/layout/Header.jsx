import { useState, useEffect } from 'react';
import { Menu, Moon, Sun, Heart, Search, ShoppingCart, User, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBusinessContext } from '../../context/BusinessContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../common/SearchBar';
import Logo from '../common/Logo';
import UserMenu from '../auth/UserMenu';
import ChatPanel from '../common/ChatPanel';
import MenuPanel from '../common/MenuPanel';

const Header = () => {
  const [showMenuPanel, setShowMenuPanel] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { businessInfo, darkMode, toggleDarkMode } = useBusinessContext();
  const { getWishlistCount, openWishlist } = useWishlist();
  const { cartCount, openCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenAuth = () => {
    navigate('/signin');
  };

  const handleOpenChat = () => {
    setShowChat(true);
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'All Gemstones', href: '/gemstones' },
    { name: 'Our Story & Contact', href: '/about' }
  ];

  const wishlistCount = getWishlistCount();

  const isActive = (href) => {
    if (href === '/' && location.pathname === '/') return true;
    if (href !== '/' && location.pathname.startsWith(href)) return true;
    return false;
  };

  const handleMenuToggle = () => {
    setShowMenuPanel(!showMenuPanel);
    setShowMobileSearch(false);
  };

  const handleSearchToggle = () => {
    setShowMobileSearch(!showMobileSearch);
    setShowMenuPanel(false);
  };

  const closeMobileMenu = () => {
    setShowMenuPanel(false);
    setShowMobileSearch(false);
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSearch = (searchTerm) => {
    if (searchTerm.trim()) {
      // Navigate to gemstones page with search query
      window.location.href = `/gemstones?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <>
      {/* Modern Glassmorphic Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'py-2 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20 border-b border-white/20 dark:border-white/10' 
            : 'py-3 sm:py-4 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md'
        }`}
      >
        {/* Animated gradient border */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
        
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Logo - Fixed width */}
            <motion.div 
              className="flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="hidden sm:block">
                <Logo size="default" onClick={closeMobileMenu} />
              </div>
              <div className="sm:hidden">
                <Logo size="small" onClick={closeMobileMenu} />
              </div>
            </motion.div>

            {/* Desktop Search Bar - Centered */}
            {location.pathname !== '/' && (
              <div className="hidden lg:flex flex-1 justify-center max-w-md xl:max-w-xl">
                <div className="relative group w-full">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative w-full">
                    <SearchBar 
                      onSearch={handleSearch}
                      placeholder="Search gemstones..."
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Navigation - Right side */}
            <div className="hidden md:flex items-center gap-4">
              {/* Nav Links */}
              <nav className="flex items-center gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="relative group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                          : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10'
                      }`}
                    >
                      {item.name}
                    </motion.div>
                  </Link>
                ))}
              </nav>

              {/* Divider */}
              <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700"></div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
              {/* Search Button for tablets */}
              {location.pathname !== '/' && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSearchToggle}
                  className="lg:hidden p-2.5 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur-sm text-neutral-600 dark:text-neutral-300 hover:bg-white/80 dark:hover:bg-white/20 hover:text-amber-600 transition-all duration-300 shadow-sm hover:shadow-md"
                  aria-label="Search"
                >
                  <Search className="w-4.5 h-4.5" />
                </motion.button>
              )}

              {/* Wishlist Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={openWishlist}
                className="relative p-2.5 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur-sm text-neutral-600 dark:text-neutral-300 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-all duration-300 shadow-sm hover:shadow-md group"
                aria-label="Wishlist"
              >
                <Heart className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                {wishlistCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold shadow-lg shadow-red-500/30"
                  >
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Cart Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={openCart}
                className="relative p-2.5 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur-sm text-neutral-600 dark:text-neutral-300 hover:bg-amber-50 dark:hover:bg-amber-500/20 hover:text-amber-600 transition-all duration-300 shadow-sm hover:shadow-md group"
                aria-label="Cart"
              >
                <ShoppingCart className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold shadow-lg shadow-emerald-500/30"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Dark Mode Toggle - Beautiful Slider */}
              <button
                onClick={toggleDarkMode}
                className="relative w-14 h-7 rounded-full p-1 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                style={{
                  background: darkMode 
                    ? 'linear-gradient(to right, #1e3a5f, #0f172a)' 
                    : 'linear-gradient(to right, #fbbf24, #f59e0b)'
                }}
                aria-label="Toggle dark mode"
              >
                {/* Stars for dark mode */}
                <div className={`absolute inset-0 overflow-hidden rounded-full transition-opacity duration-500 ${darkMode ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                  <div className="absolute top-3 left-4 w-0.5 h-0.5 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                </div>
                {/* Slider circle */}
                <motion.div
                  className="relative w-5 h-5 rounded-full shadow-lg flex items-center justify-center"
                  animate={{ 
                    x: darkMode ? 28 : 0,
                    backgroundColor: darkMode ? '#1e293b' : '#ffffff'
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  {darkMode ? (
                    <Moon className="w-3 h-3 text-blue-300" />
                  ) : (
                    <Sun className="w-3 h-3 text-amber-500" />
                  )}
                </motion.div>
              </button>

              {/* User Menu / Login Button */}
              <UserMenu onLoginClick={() => handleOpenAuth('login')} onChatClick={handleOpenChat} />
              </div>
            </div>

            {/* Mobile Actions - Compact & Responsive */}
            <div className="md:hidden flex items-center gap-1 flex-shrink-0">
              {/* Mobile Search Toggle */}
              {location.pathname !== '/' && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSearchToggle}
                  className="p-1.5 rounded-lg bg-white/50 dark:bg-white/10 backdrop-blur-sm text-neutral-600 dark:text-neutral-300 transition-all duration-300"
                  aria-label="Search"
                >
                  <Search className="w-[18px] h-[18px]" />
                </motion.button>
              )}

              {/* Mobile Dark Mode - Compact Slider */}
              <button
                onClick={toggleDarkMode}
                className="relative w-9 h-5 rounded-full p-0.5 transition-all duration-500 focus:outline-none flex-shrink-0"
                style={{
                  background: darkMode 
                    ? 'linear-gradient(to right, #1e3a5f, #0f172a)' 
                    : 'linear-gradient(to right, #fbbf24, #f59e0b)'
                }}
                aria-label="Toggle dark mode"
              >
                <motion.div
                  className="w-4 h-4 rounded-full shadow-md flex items-center justify-center"
                  animate={{ 
                    x: darkMode ? 16 : 0,
                    backgroundColor: darkMode ? '#1e293b' : '#ffffff'
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  {darkMode ? (
                    <Moon className="w-2 h-2 text-blue-300" />
                  ) : (
                    <Sun className="w-2 h-2 text-amber-500" />
                  )}
                </motion.div>
              </button>

              {/* Mobile Menu Toggle - Compact */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleMenuToggle}
                className="flex items-center gap-1 p-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/20 transition-all duration-300"
                aria-label="Open menu"
                aria-expanded={showMenuPanel}
              >
                {isAuthenticated && user ? (
                  user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-6 h-6 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-white text-[10px] font-bold">
                      {getInitials(user.name)}
                    </div>
                  )
                ) : (
                  <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-white">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
                <Menu className="w-3.5 h-3.5 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Mobile Search Bar - Glassmorphic */}
          <AnimatePresence>
            {showMobileSearch && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="md:hidden mt-3 pb-2"
              >
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-2xl blur-lg"></div>
                  <div className="relative bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-xl p-2 shadow-lg">
                    <SearchBar 
                      onSearch={handleSearch}
                      placeholder="Search gemstones..."
                      showFilters={false}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tablet Search Bar - Glassmorphic */}
          <AnimatePresence>
            {showMobileSearch && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="hidden md:block lg:hidden mt-3 pb-2"
              >
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-2xl blur-lg"></div>
                  <div className="relative bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-xl p-2 shadow-lg">
                    <SearchBar 
                      onSearch={handleSearch}
                      placeholder="Search premium gemstones..."
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.header>
      
      {/* Spacer for fixed header */}
      <div className={`transition-all duration-300 ${scrolled ? 'h-14' : 'h-16 sm:h-20'}`}></div>

      {/* Unified Menu Slide Panel */}
      <MenuPanel 
        isOpen={showMenuPanel} 
        onClose={() => setShowMenuPanel(false)}
        onChatClick={handleOpenChat}
        onCartClick={openCart}
      />

      {/* Chat Slide Panel */}
      <ChatPanel isOpen={showChat} onClose={() => setShowChat(false)} />
    </>
  );
};

export default Header; 