import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Star, 
  Sparkles, 
  ArrowRight,
  Shield,
  Award,
  Heart,
  Crown,
  Gem,
  CheckCircle,
  Users,
  Clock,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';
import GemstoneCard from '../components/gemstone/GemstoneCard';
import { gemstoneService } from '../services/api';
import { useBusinessContext } from '../context/BusinessContext';
import SEOHead, { seoConfigs } from '../components/common/SEOHead';
import LoadingSpinner, { GemstoneCardSkeleton } from '../components/common/LoadingSpinner';

const Home = () => {
  const { businessInfo } = useBusinessContext();
  const [trendingGemstones, setTrendingGemstones] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fixed categories to match database enum values
  const shopCategories = [
    { name: 'All', slug: 'all', hot: true },
    { name: 'Ruby', slug: 'Ruby', hot: true },
    { name: 'Emerald', slug: 'Emerald', hot: true },
    { name: 'Diamond', slug: 'Diamond', hot: false },
    { name: 'Sapphire', slug: 'Sapphire', hot: true },
    { name: 'Pearl', slug: 'Pearl', hot: false },
    { name: 'Topaz', slug: 'Topaz', hot: false },
    { name: 'Coral', slug: 'Coral', hot: false },
  ];

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch trending and new arrivals in parallel
      const [trendingResponse, newArrivalsResponse] = await Promise.all([
        gemstoneService.getTrendingGemstones(),
        gemstoneService.getNewArrivals()
      ]);

      console.log('Trending Response:', trendingResponse);
      console.log('New Arrivals Response:', newArrivalsResponse);

      setTrendingGemstones(trendingResponse.data?.gemstones || []);
      setNewArrivals(newArrivalsResponse.data?.gemstones || []);
    } catch (err) {
      console.error('Failed to load home data:', err);
      setError(err.message);
      
      // Set empty arrays on error
      setTrendingGemstones([]);
      setNewArrivals([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-pearl dark:bg-luxury-charcoal">
      <SEOHead {...seoConfigs.home} />
      
      {/* Ultra-Compact Header with Categories */}
      <section className="bg-white/95 dark:bg-luxury-charcoal/95 backdrop-blur-lg border-b border-luxury-platinum/30 dark:border-luxury-charcoal/30 py-3">
        <div className="max-w-7xl mx-auto px-4">
          {/* Trust badges - inline, minimal */}
          <div className="flex items-center justify-center text-xs text-neutral-warm-600 dark:text-neutral-warm-400 mb-3 space-x-6">
            <span className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-luxury-gold" />
              <span>Certified</span>
            </span>
            <span className="flex items-center space-x-1">
              <Award className="w-3 h-3 text-luxury-gold" />
              <span>100% Natural</span>
            </span>
            <span className="flex items-center space-x-1">
              <Users className="w-3 h-3 text-luxury-gold" />
              <span>3 Generations</span>
            </span>
            <span className="flex items-center space-x-1">
              <Heart className="w-3 h-3 text-luxury-gold" />
              <span>1000+ Customers</span>
            </span>
          </div>
          
          {/* Categories - compact pills */}
          <div className="flex items-center justify-start md:justify-center space-x-2 overflow-x-auto pb-2 px-4 md:px-0 -mx-4 md:mx-0 mobile-scroll">
            <div className="flex items-center space-x-2 min-w-max pl-4 pr-4 md:pl-0 md:pr-0">
            {shopCategories.map((category) => (
              <Link
                key={category.slug}
                to={category.slug === 'all' ? '/gemstones' : `/gemstones?category=${category.slug}`}
                className={`
                  relative flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                  ${category.hot 
                    ? 'bg-luxury-gold text-white shadow-md hover:shadow-lg' 
                    : 'bg-luxury-pearl dark:bg-luxury-charcoal border border-luxury-platinum/30 dark:border-luxury-charcoal/30 text-luxury-charcoal dark:text-luxury-pearl hover:border-luxury-gold/50'
                  }
                `}
              >
                <span>{category.name}</span>
                {category.hot && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-luxury-ruby rounded-full animate-pulse"></div>
                )}
              </Link>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products - Proper Card Sizes */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center space-x-2 font-luxury text-xl font-bold text-luxury-charcoal dark:text-luxury-pearl">
              <TrendingUp className="w-6 h-6 text-luxury-ruby" />
              <span>Trending Now</span>
            </h2>
            <Link 
              to="/gemstones?trending=true"
              className="text-sm text-luxury-gold hover:text-luxury-gold/80 font-medium group"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 inline ml-1 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <GemstoneCardSkeleton key={i} variant="grid" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-sm text-red-600 dark:text-red-400">
                Error loading trending gemstones: {error}
              </p>
            </div>
          ) : trendingGemstones.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {trendingGemstones.map((gemstone, index) => (
                <motion.div
                  key={gemstone._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <GemstoneCard
                    gemstone={gemstone}
                    index={index}
                    variant="grid"
                    className="luxury-card-hover gemstone-shimmer"
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-neutral-warm-300 dark:text-neutral-warm-600 mx-auto mb-4" />
              <p className="text-sm text-neutral-warm-600 dark:text-neutral-warm-400">
                No trending gemstones found. Check console for details.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals - Proper Sizing */}
      <section className="py-6 bg-gradient-to-r from-luxury-pearl/20 to-luxury-champagne/10 dark:from-luxury-charcoal/20 dark:to-gray-900/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center space-x-2 font-luxury text-lg font-bold text-luxury-charcoal dark:text-luxury-pearl">
              <Star className="w-5 h-5 text-luxury-gold" />
              <span>New Arrivals</span>
            </h3>
            <Link 
              to="/gemstones?sort=newest"
              className="text-sm text-luxury-gold hover:text-luxury-gold/80 font-medium"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <GemstoneCardSkeleton key={i} variant="grid" />
              ))}
            </div>
          ) : newArrivals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {newArrivals.map((gemstone, index) => (
                <motion.div
                  key={gemstone._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  viewport={{ once: true }}
                >
                  <GemstoneCard
                    gemstone={gemstone}
                    index={index}
                    variant="grid"
                    className="luxury-card-hover gemstone-shimmer"
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-8 h-8 text-neutral-warm-300 dark:text-neutral-warm-600 mx-auto mb-2" />
              <p className="text-sm text-neutral-warm-600 dark:text-neutral-warm-400">
                New arrivals loading...
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home; 