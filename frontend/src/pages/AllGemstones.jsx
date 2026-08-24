import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Gem, 
  Filter, 
  SlidersHorizontal,
  Grid3X3,
  List,
  TrendingUp,
  Star,
  Clock,
  Sparkles,
  ChevronDown,
  Loader
} from 'lucide-react';
import GemstoneCard from '../components/gemstone/GemstoneCard';
import SearchBar from '../components/common/SearchBar';
import FilterPanel from '../components/common/FilterPanel';
import { gemstoneService } from '../services/api';

const AllGemstones = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [gemstones, setGemstones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalGemstones, setTotalGemstones] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    category: searchParams.getAll('category'),
    purpose: searchParams.getAll('purpose'),
    color: searchParams.getAll('color'),
    trending: searchParams.get('trending') === 'true' ? ['trending'] : []
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  const itemsPerPage = 20;

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: Clock },
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'popular', label: 'Most Popular', icon: Star },
    { value: 'name', label: 'Name A-Z', icon: Gem }
  ];

  const loadGemstones = useCallback(async (page = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: itemsPerPage,
        sort: sortBy,
        ...(searchQuery && { search: searchQuery }),
        ...(filters.category.length > 0 && { category: filters.category }),
        ...(filters.purpose.length > 0 && { purpose: filters.purpose }),
        ...(filters.color.length > 0 && { color: filters.color }),
        ...(filters.trending.includes('trending') && { trending: 'true' })
      };

      const response = await gemstoneService.getGemstones(params);
      
      if (response.success) {
        const newGemstones = response.data.gemstones || [];
        
        if (append && page > 1) {
          setGemstones(prev => [...prev, ...newGemstones]);
        } else {
          setGemstones(newGemstones);
          window.scrollTo(0, 0);
        }
        
        setTotalGemstones(response.data.total || 0);
        setCurrentPage(page);
        setHasMorePages(page < (response.data.totalPages || 1));
      } else {
        throw new Error(response.message || 'Failed to load gemstones');
      }
    } catch (err) {
      console.error('Failed to load gemstones:', err);
      setError(err.message || 'Failed to load gemstones');
      
      if (page === 1) {
        setGemstones([]);
        setTotalGemstones(0);
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, sortBy]);

  const updateSearchParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    
    filters.category.forEach(cat => params.append('category', cat));
    filters.purpose.forEach(purpose => params.append('purpose', purpose));
    filters.color.forEach(color => params.append('color', color));
    
    if (filters.trending.includes('trending')) {
      params.set('trending', 'true');
    }
    
    setSearchParams(params);
  }, [searchQuery, filters, sortBy, setSearchParams]);

  useEffect(() => {
    loadGemstones(1);
  }, [loadGemstones]);

  useEffect(() => {
    updateSearchParams();
  }, [updateSearchParams]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      category: [],
      purpose: [],
      color: [],
      trending: []
    });
    setCurrentPage(1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (hasMorePages && !loading) {
      loadGemstones(currentPage + 1, true);
    }
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((count, filterArray) => {
      return count + filterArray.length;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-sapphire to-emerald rounded-full flex items-center justify-center">
                <Gem className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  All Gemstones
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {totalGemstones > 0 
                    ? `${totalGemstones} gemstone${totalGemstones === 1 ? '' : 's'} available`
                    : 'Discover our collection'
                  }
                </p>
              </div>
            </div>

            {/* Desktop View Toggle */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' 
                  ? 'bg-sapphire text-white' 
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' 
                  ? 'bg-sapphire text-white' 
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="space-y-3 sm:space-y-4">
            {/* Search Bar */}
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search gemstones by name, category, or purpose..."
              initialValue={searchQuery}
              className="w-full"
            />

            {/* Mobile Controls Row */}
            <div className="flex items-center justify-between space-x-3">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="md:hidden flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filters
                </span>
                {getActiveFilterCount() > 0 && (
                  <span className="bg-sapphire text-white text-xs px-2 py-0.5 rounded-full">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-sapphire"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-5 sm:py-6">
        <div className="flex gap-4 sm:gap-6">
          
          {/* Desktop Filter Sidebar */}
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            className="w-80 flex-shrink-0"
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
          />

          {/* Gemstones Grid */}
          <div className="flex-1">
            
            {/* Active Filters Display */}
            {getActiveFilterCount() > 0 && (
              <div className="mb-5 sm:mb-6 flex flex-wrap gap-2 overflow-x-auto pb-2 mobile-scroll">
                {filters.category.map(filter => (
                  <span key={`cat-${filter}`} className="inline-flex items-center px-3 py-1 bg-emerald/10 text-emerald-700 dark:text-emerald-400 rounded-full text-xs">
                    {filter}
                  </span>
                ))}
                {filters.purpose.map(filter => (
                  <span key={`purpose-${filter}`} className="inline-flex items-center px-3 py-1 bg-golden/10 text-golden-700 dark:text-golden-400 rounded-full text-xs">
                    {filter}
                  </span>
                ))}
                {filters.color.map(filter => (
                  <span key={`color-${filter}`} className="inline-flex items-center px-3 py-1 bg-ruby/10 text-ruby-700 dark:text-ruby-400 rounded-full text-xs">
                    {filter}
                  </span>
                ))}
                {filters.trending.includes('trending') && (
                  <span className="inline-flex items-center px-3 py-1 bg-sapphire/10 text-sapphire-700 dark:text-sapphire-400 rounded-full text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </span>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading && currentPage === 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className="premium-card animate-pulse">
                    <div className="aspect-square bg-gray-200 dark:bg-gray-600"></div>
                    <div className="p-2.5 sm:p-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              /* Error State */
              <div className="text-center py-10 sm:py-12">
                <Gem className="w-14 h-14 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="font-heading text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                  Oops! Something went wrong
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-5 sm:mb-6">{error}</p>
                <button
                  onClick={() => loadGemstones(1)}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : gemstones.length === 0 ? (
              /* Empty State */
              <div className="text-center py-10 sm:py-12">
                <Sparkles className="w-14 h-14 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="font-heading text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                  No gemstones found
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-5 sm:mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="btn-secondary"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* Gemstones Grid */
              <>
                <div className={`
                  grid gap-3 sm:gap-6
                  ${viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
                    : 'grid-cols-1'
                  }
                `}>
                  {gemstones.map((gemstone, index) => (
                    <motion.div
                      key={gemstone._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <GemstoneCard
                        gemstone={gemstone}
                        index={index}
                        variant={viewMode === 'list' ? 'list' : 'grid'}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMorePages && (
                  <div className="mt-6 sm:mt-8 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <span>Load More Gemstones</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Results Summary */}
                <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Showing {gemstones.length} of {totalGemstones} gemstones
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllGemstones; 