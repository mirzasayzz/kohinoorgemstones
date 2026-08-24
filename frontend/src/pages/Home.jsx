import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Star, 
  Sparkles, 
  ArrowRight,
  Shield,
  Award,
  Heart,
  Users,
  Search,
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  Gem,
  BookOpen
} from 'lucide-react';
import GemstoneCard from '../components/gemstone/GemstoneCard';
import { gemstoneService } from '../services/api';
import { useBusinessContext } from '../context/BusinessContext';
import SEOHead, { seoConfigs } from '../components/common/SEOHead';
import { GemstoneCardSkeleton } from '../components/common/LoadingSpinner';

const Home = () => {
  const { businessInfo } = useBusinessContext();
  const [gemstones, setGemstones] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const shopCategories = [
    { name: 'All Collection', slug: 'all', icon: Sparkles },
    { name: 'Ruby (Manik)', slug: 'Ruby', icon: Gem },
    { name: 'Emerald (Panna)', slug: 'Emerald', icon: Gem },
    { name: 'Blue Sapphire (Neelam)', slug: 'Sapphire', icon: Gem },
    { name: 'Yellow Sapphire (Pukhraj)', slug: 'Topaz', icon: Gem },
    { name: 'Red Coral (Moonga)', slug: 'Coral', icon: Gem },
    { name: 'Sea Pearl (Moti)', slug: 'Pearl', icon: Gem },
    { name: 'Moonstone (Chandrakant)', slug: 'Moonstone', icon: Gem },
    { name: 'Opal (Dudhiya)', slug: 'Opal', icon: Gem },
    { name: 'Diamond (Heera)', slug: 'Diamond', icon: Gem },
    { name: 'Turquoise (Feroza)', slug: 'Turquoise', icon: Gem }
  ];

  const fetchGemstones = useCallback(async (cat = selectedCategory, query = searchQuery, sort = sortBy, pg = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pg,
        limit: 12,
        sort: sort === 'trending' ? 'trending' : sort,
      };

      if (cat !== 'all') {
        params.category = [cat];
      }
      if (query.trim()) {
        params.search = query;
      }
      if (sort === 'trending') {
        params.trending = 'true';
      }

      const response = await gemstoneService.getGemstones(params);
      
      if (response.success && response.data) {
        const fetched = response.data.gemstones || [];
        if (append) {
          setGemstones(prev => [...prev, ...fetched]);
        } else {
          setGemstones(fetched);
        }
        setHasMore(pg < (response.data.totalPages || 1));
        setPage(pg);
      } else {
        throw new Error(response.message || 'Failed to load catalog');
      }
    } catch (err) {
      console.error('Failed to load gemstones:', err);
      setError(err.message || 'Something went wrong while fetching gemstones');
      if (!append) setGemstones([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy]);

  // Initial load and filter change trigger
  useEffect(() => {
    fetchGemstones(selectedCategory, searchQuery, sortBy, 1, false);
  }, [selectedCategory, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGemstones(selectedCategory, searchQuery, sortBy, 1, false);
  };

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchGemstones(selectedCategory, searchQuery, sortBy, page + 1, true);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
      <SEOHead {...seoConfigs.home} />

      {/* Trust Badges Bar */}
      <section className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 gap-4 overflow-x-auto scrollbar-hide py-1 mobile-scroll">
            <span className="flex items-center gap-1.5 flex-shrink-0">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>100% Certified Natural</span>
            </span>
            <span className="flex items-center gap-1.5 flex-shrink-0">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Government Laboratory Certified</span>
            </span>
            <span className="flex items-center gap-1.5 flex-shrink-0">
              <Users className="w-3.5 h-3.5 text-amber-500" />
              <span>Family Business Since 1978</span>
            </span>
            <span className="flex items-center gap-1.5 flex-shrink-0">
              <Heart className="w-3.5 h-3.5 text-amber-500" />
              <span>10,000+ Happy Customers</span>
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Category Selector Section */}
      <section className="py-6 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 sticky top-[60px] sm:top-[70px] z-30 shadow-sm backdrop-blur-md bg-white/95 dark:bg-neutral-900/95">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide mobile-scroll -mx-4 px-4">
            {shopCategories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.slug;
              return (
                <button
                  key={category.slug}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={`
                    flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border
                    ${isActive 
                      ? 'bg-amber-500 border-amber-500 text-neutral-900 shadow-md shadow-amber-500/25 scale-[1.02]' 
                      : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-amber-500/50 hover:bg-amber-500/5'
                    }
                  `}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-neutral-900' : 'text-amber-500'}`} />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Catalog View Container */}
      <section className="py-8 max-w-7xl mx-auto px-4">
        
        {/* Search, Filter Summary, and Sort bar */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Real-time Inline Search form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-grow max-w-lg w-full">
            <input
              type="text"
              placeholder="Search gemstones by name, color, or origin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  fetchGemstones(selectedCategory, '', sortBy, 1, false);
                }}
                className="absolute right-3 top-3 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                Clear
              </button>
            )}
          </form>

          {/* Sort & Settings Options */}
          <div className="flex items-center gap-3 justify-end">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Sort By:</span>
            </div>
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-neutral-700 dark:text-neutral-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="newest">New Arrivals</option>
                <option value="trending">Trending Gems</option>
                <option value="popular">Popularity</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Results Banner */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-heading font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>
              {selectedCategory === 'all' 
                ? 'All Gemstones' 
                : `${shopCategories.find(c => c.slug === selectedCategory)?.name || selectedCategory}`
              }
            </span>
          </h2>
          {searchQuery && (
            <p className="text-xs text-neutral-400">
              Search results for "{searchQuery}"
            </p>
          )}
        </div>

        {/* Products Grid with skeleton loading */}
        {loading && page === 1 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <GemstoneCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl">
            <p className="text-rose-500 mb-4 font-semibold">Error: {error}</p>
            <button
              onClick={() => fetchGemstones(selectedCategory, searchQuery, sortBy, 1, false)}
              className="bg-amber-500 hover:bg-amber-600 text-neutral-900 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Load</span>
            </button>
          </div>
        ) : gemstones.length > 0 ? (
          <>
            <motion.div 
              layout
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {gemstones.map((gemstone, index) => (
                  <motion.div
                    key={gemstone._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="h-full flex flex-col"
                  >
                    <GemstoneCard
                      gemstone={gemstone}
                      index={index}
                      variant="grid"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination Load More */}
            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white dark:text-neutral-100 px-8 py-3.5 rounded-2xl text-xs font-bold transition-all inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading Gemstones...</span>
                    </>
                  ) : (
                    <>
                      <span>Explore More Gemstones</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-8 max-w-lg mx-auto">
            <Gem className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4 animate-bounce" />
            <h3 className="font-heading text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">No gemstone listings found</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
              We couldn't find any gemstones matching your active filters. Try resetting the search or exploring other categories.
            </p>
            <button
              onClick={handleResetFilters}
              className="bg-amber-500 hover:bg-amber-600 text-neutral-900 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Astro Guide Banner - Builds trust */}
      <section id="astro-guide" className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 rounded-2xl p-4 md:p-5 shadow-lg">
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-[50px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-orange-500/5 rounded-full blur-[50px] pointer-events-none"></div>
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-2xl space-y-1">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-bold text-amber-500 bg-amber-500/10 rounded-full uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5 animate-pulse" /> Astro Consultation &amp; Energy
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Astrological Guidance &amp; Authenticity
              </h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed max-w-xl">
                Gemstones are powerful cosmic tools when selected correctly. Chat with our AI Gemstone Assistant (bottom right) or speak directly with us on WhatsApp to identify the right stone based on your Zodiac Sign (Rashi), birth planets, or specific goals.
              </p>
            </div>
            <Link
              to="/about"
              className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-neutral-950 text-[10px] font-bold px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-1 self-start md:self-auto hover:shadow-lg hover:shadow-amber-500/10 active:scale-98"
            >
              <span>Consult Our Expert</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;