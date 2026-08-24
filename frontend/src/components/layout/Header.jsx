import { useState } from 'react';
import { Menu, X, Moon, Sun, Home, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useBusinessContext } from '../../context/BusinessContext';
import { useWishlist } from '../../context/WishlistContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { businessInfo, darkMode, toggleDarkMode } = useBusinessContext();
  const { getWishlistCount } = useWishlist();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
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
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-sapphire shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          
          {/* Logo - Mobile & Desktop */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-sapphire dark:text-golden"
              onClick={closeMobileMenu}
            >
              <img 
                src="/kohinoor-logo.png" 
                alt="Site Logo" 
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
              />
              <span className="font-heading text-lg sm:text-xl font-bold gradient-text hidden sm:block">
                {businessInfo?.shopName || ''}
              </span>
              <span className="font-heading text-base font-bold gradient-text sm:hidden">
                {businessInfo?.shopName?.split(' ')?.[0] || ''}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-ruby bg-ruby/10 dark:text-golden dark:bg-golden/10'
                      : 'text-gray-700 dark:text-gray-300 hover:text-ruby dark:hover:text-golden hover:bg-ruby/5 dark:hover:bg-golden/5'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="relative p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire dark:focus-visible:ring-golden"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire dark:focus-visible:ring-golden"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire dark:focus-visible:ring-golden"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Hamburger Menu */}
            <button
              onClick={handleMenuToggle}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire dark:focus-visible:ring-golden"
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
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-nav">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-sapphire shadow-lg border-t dark:border-gray-700 max-h-[calc(100vh-56px)] overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-ruby bg-ruby/10 dark:text-golden dark:bg-golden/10'
                      : 'text-gray-700 dark:text-gray-300 hover:text-ruby dark:hover:text-golden hover:bg-ruby/5 dark:hover:bg-golden/5'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-ruby dark:hover:text-golden hover:bg-ruby/5 dark:hover:bg-golden/5 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <Heart className="w-4 h-4" />
                <span>My Wishlist</span>
              </div>
              {wishlistCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>
            
            {/* Mobile Contact Info */}
            <div className="pt-4 mt-4 border-t dark:border-gray-700">
              <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                Quick Contact
              </div>
              <a
                href={`tel:${businessInfo?.contact?.phone}`}
                className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-ruby dark:hover:text-golden truncate"
              >
                📞 {businessInfo?.contact?.phone}
              </a>
              <a
                href={`mailto:${businessInfo?.contact?.email}`}
                className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-ruby dark:hover:text-golden truncate"
              >
                ✉️ {businessInfo?.contact?.email}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 