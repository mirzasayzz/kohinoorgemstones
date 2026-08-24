import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Star, 
  Shield, 
  Award, 
  Eye,
  Heart,
  Share2,
  Sparkles,
  Gem,
  MapPin,
  Calendar,
  TrendingUp,
  Zap,
  Info
} from 'lucide-react';
import ImageGallery from '../components/gemstone/ImageGallery';
import WhatsAppButton from '../components/common/WhatsAppButton';
import GemstoneCard from '../components/gemstone/GemstoneCard';
import SEOHead from '../components/common/SEOHead';
import { gemstoneService } from '../services/api';
import { useBusiness } from '../context/BusinessContext';

const GemstoneDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { businessInfo } = useBusiness();
  
  const [gemstone, setGemstone] = useState(null);
  const [relatedGemstones, setRelatedGemstones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  // Load gemstone data
  useEffect(() => {
    loadGemstoneDetail();
  }, [slug]);

  const loadGemstoneDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await gemstoneService.getGemstone(slug);
      
      if (response.success && response.data) {
        // Handle both possible response structures
        const gemstoneData = response.data.gemstone || response.data;
        
        if (gemstoneData) {
          setGemstone(gemstoneData);
          
          // Load related gemstones
          if (gemstoneData.category) {
            try {
              const relatedResponse = await gemstoneService.getGemstones({
                category: gemstoneData.category,
                limit: 4,
                exclude: gemstoneData._id
              });
              
              if (relatedResponse.success && relatedResponse.data) {
                setRelatedGemstones(relatedResponse.data.gemstones || relatedResponse.data || []);
              }
            } catch (relatedError) {
              console.error('Failed to load related gemstones:', relatedError);
              // Don't fail the main request if related fails
            }
          }
        } else {
          throw new Error('Gemstone data not found in response');
        }
      } else {
        throw new Error(response.message || response.error || 'Gemstone not found');
      }
    } catch (err) {
      console.error('Failed to load gemstone:', err);
      setError(err.message || 'Failed to load gemstone');
      
      // Don't set mock data - let the error state handle it
      setGemstone(null);
    } finally {
      setLoading(false);
    }
  };

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: `${gemstone?.name?.english} - Kohinoor Gemstone`,
      text: gemstone?.summary || `Beautiful ${gemstone?.category} from Kohinoor Gemstone`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Add toast notification here
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  // Tab content
  const tabContent = {
    description: {
      title: 'Description',
      icon: Info,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white mb-3">
              About this {gemstone?.category}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {gemstone?.description}
            </p>
          </div>

          {gemstone?.origin && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Origin
              </h4>
              <p className="text-gray-600 dark:text-gray-400">{gemstone.origin}</p>
            </div>
          )}

          {gemstone?.uses && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Uses & Applications
              </h4>
              <p className="text-gray-600 dark:text-gray-400">{gemstone.uses}</p>
            </div>
          )}
        </div>
      )
    },
    astrology: {
      title: 'Astrology',
      icon: Sparkles,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Astrological Benefits
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {gemstone?.astrologyBenefits || 'This gemstone is believed to bring positive energy and spiritual growth to the wearer.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gemstone?.purpose?.map((purpose, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-golden" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {purpose}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    specifications: {
      title: 'Specs',
      icon: Award,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Category</div>
              <div className="font-semibold text-gray-900 dark:text-white">{gemstone?.category}</div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Color</div>
              <div className="font-semibold text-gray-900 dark:text-white">{gemstone?.color}</div>
            </div>

            {gemstone?.weight && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Weight</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {typeof gemstone.weight === 'object' 
                    ? `${gemstone.weight.value} ${gemstone.weight.unit}` 
                    : gemstone.weight}
                </div>
              </div>
            )}

            {gemstone?.dimensions && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Dimensions</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {typeof gemstone.dimensions === 'object' 
                    ? `${gemstone.dimensions.length} × ${gemstone.dimensions.width} × ${gemstone.dimensions.height} ${gemstone.dimensions.unit}` 
                    : gemstone.dimensions}
                </div>
              </div>
            )}
          </div>

          {gemstone?.certification?.certified && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Certified Gemstone
                </span>
              </div>
              <div className="text-sm text-emerald-700 dark:text-emerald-400">
                Certified by {gemstone.certification.authority || 'Recognized Authority'}
              </div>
            </div>
          )}
        </div>
      )
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !gemstone) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Gem className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Gemstone Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The gemstone you are looking for could not be found.'}
          </p>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-700 dark:text-red-300 text-sm">
                <strong>Debug Info:</strong> {error}
              </p>
              <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                Slug: {slug} | Expected URL: /gemstone/natural-pearl-moti
              </p>
            </div>
          )}
          <div className="space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary px-6 py-2"
            >
              Go Back
            </button>
            <Link to="/gemstones" className="btn-primary px-6 py-2">
              Browse All Gemstones
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${gemstone.name?.english || 'Gemstone'}${gemstone.name?.urdu ? ` (${gemstone.name.urdu})` : ''}`}
        description={gemstone.summary || `Beautiful ${gemstone.category} gemstone from ${gemstone.origin || 'premium collection'}. ${gemstone.purpose ? `Perfect for ${gemstone.purpose.join(', ')}.` : ''}`}
        keywords={`${gemstone.name?.english}, ${gemstone.category}, gemstone, ${gemstone.color}, ${gemstone.origin}, ${gemstone.purpose?.join(', ')}`}
        image={gemstone.images?.[0]?.url}
        type="product"
        gemstone={gemstone}
      />
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Back Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ImageGallery 
              images={gemstone.images} 
              gemstone={gemstone}
              className="lg:sticky lg:top-8"
            />
          </motion.div>

          {/* Gemstone Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {gemstone.trending && (
                    <span className="bg-ruby text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Trending</span>
                    </span>
                  )}
                  <span className="bg-emerald/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
                    {gemstone.category}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Names */}
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {gemstone.name.english}
              </h1>
              {gemstone.name.urdu && (
                <p className="text-xl text-gray-600 dark:text-gray-400 font-medium mb-4">
                  {gemstone.name.urdu}
                </p>
              )}

              {/* Summary */}
              {gemstone.summary && (
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  {gemstone.summary}
                </p>
              )}
            </div>

            {/* Key Features */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-golden/10 text-golden-700 dark:text-golden-400 px-3 py-1 rounded-full text-sm font-medium">
                {gemstone.color}
              </span>
              {gemstone.purpose?.slice(0, 2).map((purpose, index) => (
                <span
                  key={index}
                  className="bg-sapphire/10 text-sapphire-700 dark:text-sapphire-400 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {purpose}
                </span>
              ))}
              {gemstone.purpose?.length > 2 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  +{gemstone.purpose.length - 2} more
                </span>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <Eye className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {gemstone.viewCount || 0}
                </div>
                <div className="text-xs text-gray-500">Views</div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <Shield className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {gemstone.certification?.certified ? 'Yes' : 'No'}
                </div>
                <div className="text-xs text-gray-500">Certified</div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <Zap className="w-5 h-5 text-golden mx-auto mb-1" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {gemstone.availability || 'Available'}
                </div>
                <div className="text-xs text-gray-500">Status</div>
              </div>
              
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <Calendar className="w-5 h-5 text-sapphire mx-auto mb-1" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Natural
                </div>
                <div className="text-xs text-gray-500">Type</div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {Object.entries(tabContent).map(([key, tab]) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`
                        flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors
                        ${activeTab === key
                          ? 'text-sapphire dark:text-golden border-b-2 border-sapphire dark:border-golden bg-sapphire/5 dark:bg-golden/5'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {tabContent[activeTab].content}
              </div>
            </div>

            {/* Desktop WhatsApp Button */}
            <div className="hidden lg:block">
              <WhatsAppButton
                gemstone={gemstone}
                position="inline"
                size="large"
              />
            </div>
          </motion.div>
        </div>

        {/* Related Gemstones */}
        {relatedGemstones.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16"
          >
            <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Similar {gemstone.category} Gemstones
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedGemstones.map((relatedGemstone, index) => (
                <GemstoneCard
                  key={relatedGemstone._id}
                  gemstone={relatedGemstone}
                  index={index}
                  variant="grid"
                />
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Mobile Sticky WhatsApp Button */}
      <div className="lg:hidden">
        <WhatsAppButton
          gemstone={gemstone}
          position="sticky"
          size="default"
        />
      </div>
    </div>
    </>
  );
};

export default GemstoneDetail; 