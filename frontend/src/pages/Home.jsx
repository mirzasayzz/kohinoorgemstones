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
  Crown
} from 'lucide-react';
import GemstoneCard from '../components/gemstone/GemstoneCard';
import { gemstoneService } from '../services/api';
import { useBusiness } from '../context/BusinessContext';
import SEOHead, { seoConfigs } from '../components/common/SEOHead';
import LoadingSpinner, { GemstoneCardSkeleton } from '../components/common/LoadingSpinner';

const Home = () => {
  const { businessInfo } = useBusiness();
  const [trendingGemstones, setTrendingGemstones] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Categories for scrollable pills
  const categories = [
    'All', 'Ruby', 'Emerald', 'Diamond', 'Sapphire', 
    'Pearl', 'Topaz', 'Coral', 'Turquoise', 'Aqeeq'
  ];

  const trustFeatures = [
    {
      icon: Shield,
      title: '100% Certified',
      description: 'Authentic gemstones with certificates'
    },
    {
      icon: Award,
      title: '100% Natural',
      description: 'No artificial treatments or enhancements'
    },
    {
      icon: Heart,
      title: 'Heritage Business',
      description: 'Three generations of gemstone expertise'
    }
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
        gemstoneService.getTrendingGemstones(8), // Limit to 8 for mobile
        gemstoneService.getNewArrivals(8)
      ]);

      setTrendingGemstones(trendingResponse.data?.gemstones || []);
      setNewArrivals(newArrivalsResponse.data?.gemstones || []);
    } catch (err) {
      console.error('Failed to load home data:', err);
      setError(err.message);
      
      // Set mock data for development
      setTrendingGemstones([]);
      setNewArrivals([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SEOHead {...seoConfigs.home} />
      
      {/* No Hero Banner - Direct Product Display as per memory.md */}
      
      {/* Categories Pills - Mobile Scrollable */}
      <section className="bg-gray-50 dark:bg-gray-800 py-4 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category, index) => (
              <Link
                key={category}
                to={category === 'All' ? '/gemstones' : `/gemstones?category=${category.toLowerCase()}`}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${index === 0 
                    ? 'bg-sapphire text-white shadow-lg' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-sapphire hover:text-white shadow-md'
                  }
                `}
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Gemstones Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-ruby" />
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Trending Gemstones
              </h2>
            </div>
            <Link 
              to="/gemstones?trending=true"
              className="text-sapphire dark:text-golden hover:underline flex items-center space-x-1"
            >
              <span className="text-sm font-medium">View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <GemstoneCardSkeleton key={i} variant="grid" />
              ))}
            </div>
          ) : trendingGemstones.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {trendingGemstones.map((gemstone, index) => (
                <GemstoneCard
                  key={gemstone._id}
                  gemstone={gemstone}
                  index={index}
                  variant="grid"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No trending gemstones available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Star className="w-6 h-6 text-golden" />
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                New Arrivals
              </h2>
            </div>
            <Link 
              to="/gemstones?sort=newest"
              className="text-sapphire dark:text-golden hover:underline flex items-center space-x-1"
            >
              <span className="text-sm font-medium">View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <GemstoneCardSkeleton key={i} variant="grid" />
              ))}
            </div>
          ) : newArrivals.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {newArrivals.map((gemstone, index) => (
                <GemstoneCard
                  key={gemstone._id}
                  gemstone={gemstone}
                  index={index}
                  variant="grid"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No new arrivals available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Family Trust Block - Compact */}
      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Why Choose Kohinoor?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Three generations of gemstone expertise
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {trustFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 bg-gradient-to-r from-sapphire to-ruby rounded-full flex items-center justify-center shadow-lg">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="font-heading text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section - Compact */}
      <section className="py-6 sm:py-8 bg-gradient-to-r from-sapphire via-ruby to-emerald">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-white mb-3">
            {businessInfo?.tagline || 'Find Your Perfect Gemstone'}
          </h2>
          <p className="text-white/90 text-sm sm:text-base mb-4 max-w-lg mx-auto">
            {businessInfo?.description || 'Authentic, certified gemstones with our family guarantee'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/gemstones"
              className="btn-primary bg-white text-sapphire hover:bg-gray-100 px-6 py-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Collection</span>
            </Link>
            <Link
              to="/contact"
              className="btn-secondary border-white text-white hover:bg-white hover:text-sapphire px-6 py-2 text-sm"
            >
              Get Guidance
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 