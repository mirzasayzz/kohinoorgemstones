import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Trash2, 
  ShoppingCart, 
  Share2, 
  MessageCircle,
  Star,
  Eye,
  Sparkles,
  ArrowLeft,
  Filter,
  SortDesc
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useBusiness } from '../context/BusinessContext';
import GemstoneCard from '../components/gemstone/GemstoneCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SEOHead from '../components/common/SEOHead';

const Wishlist = () => {
  const { wishlistItems, isLoading, clearWishlist, removeFromWishlist } = useWishlist();
  const { generateWhatsAppURL } = useBusiness();
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Get unique categories for filtering
  const categories = [...new Set(wishlistItems.map(item => item.category))];

  // Filter and sort wishlist items
  const filteredAndSortedItems = wishlistItems
    .filter(item => filterBy === 'all' || item.category === filterBy)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.addedAt) - new Date(a.addedAt);
        case 'oldest':
          return new Date(a.addedAt) - new Date(b.addedAt);
        case 'name':
          return a.name.english.localeCompare(b.name.english);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'popular':
          return (b.viewCount || 0) - (a.viewCount || 0);
        default:
          return 0;
      }
    });

  const handleClearWishlist = () => {
    clearWishlist();
    setShowClearConfirm(false);
  };

  const handleWhatsAppAll = () => {
    if (!generateWhatsAppURL || wishlistItems.length === 0) return;

    const message = `Hi! I'm interested in these gemstones from my wishlist:\n\n${wishlistItems.map((item, index) => 
      `${index + 1}. ${item.name.english} (${item.category})`
    ).join('\n')}\n\nCould you please provide more details and pricing?`;

    const whatsappData = generateWhatsAppURL({ 
      name: { english: 'Multiple Gemstones' }, 
      category: 'Wishlist',
      customMessage: message 
    });

    if (whatsappData && whatsappData.open) {
      whatsappData.open();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="My Wishlist"
        description={`Your saved gemstones - ${wishlistItems.length} items in your wishlist`}
        keywords="wishlist, saved gemstones, favorite gemstones"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link 
                  to="/" 
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white fill-current" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {wishlistItems.length} {wishlistItems.length === 1 ? 'gemstone' : 'gemstones'} saved
                    </p>
                  </div>
                </div>
              </div>

              {wishlistItems.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleWhatsAppAll}
                    className="hidden sm:flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Inquire All</span>
                  </button>
                  
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Clear Wishlist"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {wishlistItems.length === 0 ? (
            // Empty State
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Your Wishlist is Empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Start building your collection by adding gemstones you love. Click the heart icon on any gemstone to save it here.
              </p>
              <Link
                to="/gemstones"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-sapphire to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
              >
                <Sparkles className="w-5 h-5" />
                <span>Explore Gemstones</span>
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Filters and Sort */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center space-x-4">
                  {/* Category Filter */}
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value)}
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sapphire focus:border-transparent"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="flex items-center space-x-2">
                    <SortDesc className="w-4 h-4 text-gray-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sapphire focus:border-transparent"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name">Name A-Z</option>
                      <option value="category">Category</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="flex sm:hidden items-center space-x-2 w-full">
                  <button
                    onClick={handleWhatsAppAll}
                    className="flex-1 flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Inquire All</span>
                  </button>
                </div>
              </div>

              {/* Wishlist Grid */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
              >
                {filteredAndSortedItems.map((gemstone, index) => (
                  <motion.div
                    key={gemstone._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GemstoneCard 
                      gemstone={gemstone} 
                      index={index}
                      variant="grid"
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Results Info */}
              <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
                Showing {filteredAndSortedItems.length} of {wishlistItems.length} saved gemstones
                {filterBy !== 'all' && ` in ${filterBy}`}
              </div>
            </>
          )}
        </div>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Clear Wishlist?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This will remove all {wishlistItems.length} gemstones from your wishlist. This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearWishlist}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist; 