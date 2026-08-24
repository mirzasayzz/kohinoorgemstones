import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart,
  Share2,
  MessageCircle,
  Star,
  Shield,
  Award,
  Gem,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import WhatsAppButton from '../components/common/WhatsAppButton';
import GemstoneCard from '../components/gemstone/GemstoneCard';
import SEOHead from '../components/common/SEOHead';
import { gemstoneService } from '../services/api';
import { useBusinessContext } from '../context/BusinessContext';
import { useWishlist } from '../context/WishlistContext';

const GemstoneDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { generateWhatsAppURL } = useBusinessContext();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [gemstone, setGemstone] = useState(null);
  const [relatedGemstones, setRelatedGemstones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

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
      setGemstone(null);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: gemstone?.name?.english || 'Gemstone',
      text: gemstone?.summary || `Beautiful ${gemstone?.category}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleWhatsAppClick = () => {
    if (generateWhatsAppURL && gemstone) {
      const whatsappData = generateWhatsAppURL(gemstone);
      if (whatsappData && whatsappData.open) {
        whatsappData.open();
      } else {
        const url = typeof whatsappData === 'string' ? whatsappData : whatsappData.webUrl;
        window.open(url, '_blank');
      }
    }
  };

  const handleWishlistToggle = () => {
    toggleWishlist(gemstone);
  };

  const images = gemstone?.images?.length > 0 
    ? gemstone.images 
    : [{ url: '/placeholder-gemstone.svg', alt: 'No image available' }];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading gemstone details...</p>
        </div>
      </div>
    );
  }

  if (error || !gemstone) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Gem className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Gemstone Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The gemstone you are looking for could not be found.'}</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Go Back
            </button>
            <Link 
              to="/gemstones" 
              className="px-6 py-2 bg-luxury-gold text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
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
        description={gemstone.summary || `Beautiful ${gemstone.category} gemstone from premium collection.`}
        keywords={`${gemstone.name?.english}, ${gemstone.category}, gemstone, ${gemstone.color}`}
        image={gemstone.images?.[0]?.url}
        type="product"
        gemstone={gemstone}
      />
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-40 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className={`p-2 transition-colors rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    isInWishlist(gemstone._id) 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-400 dark:text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(gemstone._id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden group">
                <img
                  src={images[currentImageIndex]?.url}
                  alt={images[currentImageIndex]?.alt || gemstone.name?.english}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = '/placeholder-gemstone.svg';
                  }}
                />
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-luxury-gold' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt || `${gemstone.name?.english} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-gemstone.svg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Gemstone Information */}
            <div className="space-y-8">
              {/* Header */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  {gemstone.trending && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Trending
                    </span>
                  )}
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                    {gemstone.category}
                  </span>
                  {gemstone.certification?.certified && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Shield className="w-3 h-3" />
                      <span>Certified</span>
                    </span>
                  )}
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3">
                  {gemstone.name?.english}
                </h1>
                
                {gemstone.name?.urdu && (
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-4 font-medium">
                    {gemstone.name.urdu}
                  </p>
                )}

                {gemstone.summary && (
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {gemstone.summary}
                  </p>
                )}
              </div>

                             {/* Price */}
               {gemstone?.priceRange && (gemstone.priceRange.min || gemstone.priceRange.max) && (
                 <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800">
                   <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                     ₹{gemstone.priceRange.min && gemstone.priceRange.max ? 
                       `${gemstone.priceRange.min.toLocaleString('en-IN')} - ₹${gemstone.priceRange.max.toLocaleString('en-IN')}` :
                       gemstone.priceRange.min ? 
                         `${gemstone.priceRange.min.toLocaleString('en-IN')}+` :
                         `Up to ₹${gemstone.priceRange.max.toLocaleString('en-IN')}`
                     }
                   </div>
                   <p className="text-emerald-700 dark:text-emerald-300 text-sm">Contact us for exact pricing and availability</p>
                 </div>
               )}

                             {/* Key Details */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                   <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Color</div>
                   <div className="font-semibold text-gray-900 dark:text-white">{gemstone.color}</div>
                 </div>
                 
                 {gemstone.weight && (
                   <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                     <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Weight</div>
                     <div className="font-semibold text-gray-900 dark:text-white">
                       {gemstone.weight.value} {gemstone.weight.unit}
                     </div>
                   </div>
                 )}
                 
                 {gemstone.origin && (
                   <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                     <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Origin</div>
                     <div className="font-semibold text-gray-900 dark:text-white">{gemstone.origin}</div>
                   </div>
                 )}
                 
                 <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                   <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Availability</div>
                   <div className="font-semibold text-gray-900 dark:text-white">{gemstone.availability || 'Available'}</div>
                 </div>
               </div>

                             {/* Purpose Tags */}
               {gemstone.purpose && gemstone.purpose.length > 0 && (
                 <div>
                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Perfect For</h3>
                   <div className="flex flex-wrap gap-2">
                     {gemstone.purpose.map((purpose, index) => (
                       <span
                         key={index}
                         className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg text-sm font-medium"
                       >
                         {purpose}
                       </span>
                     ))}
                   </div>
                 </div>
               )}

               {/* Action Buttons */}
               <div className="space-y-4">
                 <button
                   onClick={handleWhatsAppClick}
                   className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
                 >
                   <MessageCircle className="w-5 h-5" />
                   <span>Contact via WhatsApp</span>
                 </button>
                 
                 <div className="grid grid-cols-2 gap-3">
                   <button
                     onClick={handleWishlistToggle}
                     className={`py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 ${
                       isInWishlist(gemstone._id)
                         ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                         : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                     }`}
                   >
                     <Heart className={`w-4 h-4 ${isInWishlist(gemstone._id) ? 'fill-current' : ''}`} />
                     <span>{isInWishlist(gemstone._id) ? 'Saved' : 'Save'}</span>
                   </button>
                   
                   <button
                     onClick={handleShare}
                     className="py-3 rounded-xl font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                   >
                     {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                     <span>{copied ? 'Copied!' : 'Share'}</span>
                   </button>
                 </div>
               </div>
            </div>
          </div>

                     {/* Description */}
           {gemstone.description && (
             <div className="mt-16 max-w-4xl">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">About This Gemstone</h2>
               <div className="prose prose-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                 <p>{gemstone.description}</p>
               </div>
             </div>
           )}

           {/* Certification Details */}
           {gemstone.certification?.certified && (
             <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
               <div className="flex items-center space-x-3 mb-4">
                 <div className="w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                   <Award className="w-6 h-6 text-white" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">Certified Authentic</h3>
                   <p className="text-blue-700 dark:text-blue-300">Verified by recognized gemological institute</p>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                 {gemstone.certification.certificateNumber && (
                   <div>
                     <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Certificate Number</div>
                     <div className="text-blue-900 dark:text-blue-100 font-semibold">{gemstone.certification.certificateNumber}</div>
                   </div>
                 )}
                 {gemstone.certification.certifyingBody && (
                   <div>
                     <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Certified By</div>
                     <div className="text-blue-900 dark:text-blue-100 font-semibold">{gemstone.certification.certifyingBody}</div>
                   </div>
                 )}
               </div>
             </div>
           )}

           {/* Related Gemstones */}
           {relatedGemstones.length > 0 && (
             <div className="mt-20">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Similar {gemstone.category} Gemstones</h2>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                 {relatedGemstones.map((relatedGemstone, index) => (
                   <GemstoneCard
                     key={relatedGemstone._id}
                     gemstone={relatedGemstone}
                     index={index}
                     variant="grid"
                   />
                 ))}
               </div>
             </div>
           )}
        </div>
      </div>
    </>
  );
};

export default GemstoneDetail; 