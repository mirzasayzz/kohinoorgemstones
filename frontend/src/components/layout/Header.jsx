import { useState } from 'react';
import { Menu, X, Moon, Sun, Heart, Search, Phone, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBusinessContext } from '../../context/BusinessContext';
import { useWishlist } from '../../context/WishlistContext';
import SearchBar from '../common/SearchBar';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const location = useLocation();
  const { businessInfo, darkMode, toggleDarkMode } = useBusinessContext();
  const { getWishlistCount } = useWishlist();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'All Gemstones', href: '/gemstones' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  const wishlistCount = getWishlistCount();

  const isActive = (href) => {
    if (href === '/' && location.pathname === '/') return true;
    if (href !== '/' && location.pathname.startsWith(href)) return true;
    return false;
  };

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setShowMobileSearch(false);
  };

  const handleSearchToggle = () => {
    setShowMobileSearch(!showMobileSearch);
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setShowMobileSearch(false);
  };

  const handleSearch = (searchTerm) => {
    if (searchTerm.trim()) {
      // Navigate to gemstones page with search query
      window.location.href = `/gemstones?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <>
      {/* Main Header */}
      <header className="bg-white/95 dark:bg-luxury-charcoal/95 backdrop-luxury border-b border-luxury-platinum/30 dark:border-luxury-charcoal/30 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            
            {/* Logo Section - Enhanced Visibility */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center space-x-3 group"
                onClick={closeMobileMenu}
              >
                {/* Logo with enhanced visibility */}
                <div className="relative">
                  <img 
                    src="/kohinoor-logo.png" 
                    alt="Kohinoor Logo" 
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain transition-all duration-300 group-hover:scale-110 filter brightness-110 contrast-125"
                    style={{ opacity: 1 }}
                  />
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-luxury-gold/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md scale-150"></div>
                  {/* Stroke/border effect */}
                  <div className="absolute inset-0 rounded-full border-2 border-luxury-gold/20 group-hover:border-luxury-gold/40 transition-colors duration-300"></div>
                </div>
                
                {/* Brand Text - Enhanced */}
                <div className="hidden sm:block">
                  <div className="relative">
                    {/* Main brand name with stroke */}
                    <h1 
                      className="font-luxury text-2xl font-bold text-luxury-charcoal dark:text-luxury-pearl group-hover:text-luxury-gold transition-colors duration-300"
                      style={{ 
                        opacity: 1,
                        textShadow: '0 1px 2px rgba(0,0,0,0.1), 0 0 0 1px rgba(212,175,55,0.1)',
                        WebkitTextStroke: '0.5px rgba(212,175,55,0.2)'
                      }}
                    >
                      {businessInfo?.shopName || 'Kohinoor'}
                    </h1>
                    
                    {/* Subtitle with better contrast */}
                    <div 
                      className="text-xs font-semibold tracking-wide text-luxury-gold/90 dark:text-luxury-gold"
                      style={{ 
                        opacity: 1,
                        textShadow: '0 1px 1px rgba(0,0,0,0.2)'
                      }}
                    >
                      Premium Gemstones
                    </div>
                  </div>
                </div>
                
                {/* Mobile brand text */}
                <div className="sm:hidden">
                  <div className="relative">
                    <h1 
                      className="font-luxury text-xl font-bold text-luxury-charcoal dark:text-luxury-pearl group-hover:text-luxury-gold transition-colors duration-300"
                      style={{ 
                        opacity: 1,
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        WebkitTextStroke: '0.3px rgba(212,175,55,0.2)'
                      }}
                    >
                      {businessInfo?.shopName?.split(' ')?.[0] || 'Kohinoor'}
                    </h1>
                    <div 
                      className="text-xs font-medium text-luxury-gold/90"
                      style={{ 
                        opacity: 1,
                        textShadow: '0 1px 1px rgba(0,0,0,0.2)'
                      }}
                    >
                      Premium
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden lg:block flex-1 max-w-2xl mx-8">
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Search premium gemstones, jewelry..."
                className="w-full"
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Search Button for tablets */}
              <button
                onClick={handleSearchToggle}
                className="lg:hidden p-2 rounded-xl text-luxury-charcoal dark:text-luxury-pearl hover:bg-luxury-champagne/20 dark:hover:bg-luxury-charcoal/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Button */}
              <Link
                to="/wishlist"
                className="relative p-2 rounded-xl text-luxury-charcoal dark:text-luxury-pearl hover:bg-luxury-champagne/20 dark:hover:bg-luxury-charcoal/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold group"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 group-hover:text-luxury-ruby transition-colors duration-200" />
                {wishlistCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-luxury-ruby text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-luxury"
                  >
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </motion.span>
                )}
              </Link>

              {/* Dark Mode Slider Toggle */}
              <div 
                onClick={toggleDarkMode}
                className="relative w-12 h-6 bg-luxury-champagne dark:bg-luxury-charcoal border-2 border-luxury-platinum/30 dark:border-luxury-charcoal/50 rounded-full cursor-pointer transition-all duration-300 hover:shadow-md"
                role="button"
                tabIndex={0}
                aria-label="Toggle dark mode"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleDarkMode();
                  }
                }}
              >
                {/* Slider Track */}
                <div className="absolute inset-0.5 rounded-full overflow-hidden">
                  <div className={`absolute inset-0 transition-all duration-500 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900' 
                      : 'bg-gradient-to-r from-yellow-200 via-orange-200 to-blue-200'
                  }`}>
                    {/* Stars for dark mode */}
                    {darkMode && (
                      <div className="absolute inset-0">
                        <div className="absolute top-0.5 left-1.5 w-0.5 h-0.5 bg-white rounded-full animate-pulse"></div>
                        <div className="absolute top-1.5 right-2 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute bottom-0.5 left-2.5 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Slider Button */}
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
                  darkMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}>
                  {darkMode ? (
                    <Moon className="w-3 h-3 text-slate-700" />
                  ) : (
                    <Sun className="w-3 h-3 text-amber-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Search Toggle */}
              <button
                onClick={handleSearchToggle}
                className="p-2 rounded-xl text-luxury-charcoal dark:text-luxury-pearl hover:bg-luxury-champagne/20 dark:hover:bg-luxury-charcoal/20 transition-all duration-200"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Mobile Dark Mode Slider Toggle */}
              <div 
                onClick={toggleDarkMode}
                className="relative w-12 h-6 bg-luxury-champagne dark:bg-luxury-charcoal border-2 border-luxury-platinum/30 dark:border-luxury-charcoal/50 rounded-full cursor-pointer transition-all duration-300 hover:shadow-md"
                role="button"
                tabIndex={0}
                aria-label="Toggle dark mode"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleDarkMode();
                  }
                }}
              >
                {/* Slider Track */}
                <div className="absolute inset-0.5 rounded-full overflow-hidden">
                  <div className={`absolute inset-0 transition-all duration-500 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900' 
                      : 'bg-gradient-to-r from-yellow-200 via-orange-200 to-blue-200'
                  }`}>
                    {/* Stars for dark mode */}
                    {darkMode && (
                      <div className="absolute inset-0">
                        <div className="absolute top-0.5 left-1.5 w-0.5 h-0.5 bg-white rounded-full animate-pulse"></div>
                        <div className="absolute top-1.5 right-2 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute bottom-0.5 left-2.5 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Slider Button */}
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
                  darkMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}>
                  {darkMode ? (
                    <Moon className="w-3 h-3 text-slate-700" />
                  ) : (
                    <Sun className="w-3 h-3 text-amber-500" />
                  )}
                </div>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={handleMenuToggle}
                className="p-2 rounded-xl text-luxury-charcoal dark:text-luxury-pearl hover:bg-luxury-champagne/20 dark:hover:bg-luxury-charcoal/20 transition-all duration-200"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-nav"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <AnimatePresence>
            {showMobileSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden pb-4 border-t border-luxury-platinum/20 dark:border-luxury-charcoal/20 mt-4 pt-4"
              >
                <SearchBar 
                  onSearch={handleSearch}
                  placeholder="Search gemstones..."
                  showFilters={false}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tablet Search Bar */}
          <AnimatePresence>
            {showMobileSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden md:block lg:hidden pb-4 border-t border-luxury-platinum/20 dark:border-luxury-charcoal/20 mt-4 pt-4"
              >
                <SearchBar 
                  onSearch={handleSearch}
                  placeholder="Search premium gemstones, jewelry..."
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-luxury-platinum/20 dark:border-luxury-charcoal/20"
              id="mobile-nav"
            >
              <div className="px-4 pt-2 pb-4 space-y-1 bg-white/98 dark:bg-luxury-charcoal/98 backdrop-blur-xl">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? 'text-luxury-gold bg-luxury-gold/10 shadow-luxury'
                          : 'text-luxury-charcoal dark:text-luxury-pearl hover:text-luxury-gold hover:bg-luxury-champagne/20 dark:hover:bg-luxury-charcoal/20'
                      }`}
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                {/* Mobile Wishlist Link */}
                <Link
                  to="/wishlist"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-luxury-charcoal dark:text-luxury-pearl hover:text-luxury-gold hover:bg-luxury-champagne/20 dark:hover:bg-luxury-charcoal/20 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5" />
                    <span>My Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="bg-luxury-ruby text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium shadow-luxury">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>
                
                {/* Mobile Contact Info */}
                <div className="pt-4 mt-4 border-t border-luxury-platinum/20 dark:border-luxury-charcoal/20">
                  <div className="px-4 py-2 text-xs font-medium text-neutral-warm-600 dark:text-neutral-warm-400 uppercase tracking-wider">
                    Quick Contact
                  </div>
                  <a
                    href={`tel:${businessInfo?.contact?.phone}`}
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-luxury-charcoal dark:text-luxury-pearl hover:text-luxury-gold transition-colors duration-200"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{businessInfo?.contact?.phone}</span>
                  </a>
                  <a
                    href={`mailto:${businessInfo?.contact?.email}`}
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-luxury-charcoal dark:text-luxury-pearl hover:text-luxury-gold transition-colors duration-200"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{businessInfo?.contact?.email}</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header; 