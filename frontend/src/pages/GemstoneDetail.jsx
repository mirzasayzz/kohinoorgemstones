import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  BadgeCheck,
  Check,
  ShoppingCart,
  Compass,
  FileText,
  Calendar,
  Layers,
  MapPin,
  Maximize2
} from 'lucide-react';
import GemstoneCard from '../components/gemstone/GemstoneCard';
import SEOHead from '../components/common/SEOHead';
import { gemstoneService } from '../services/api';
import { useBusinessContext } from '../context/BusinessContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useGlobalToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { SITE_CONFIG } from '../config/config';

const GemstoneDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { generateWhatsAppURL } = useBusinessContext();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useGlobalToast();
  
  const [gemstone, setGemstone] = useState(null);
  const [relatedGemstones, setRelatedGemstones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showCertImage, setShowCertImage] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Load gemstone data
  useEffect(() => {
    loadGemstoneDetail();
    // Reset indices
    setCurrentImageIndex(0);
    setActiveTab('details');
  }, [slug]);

  // Scroll handler for mobile sticky bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    const shareUrl = `${SITE_CONFIG.BASE_URL}/gemstone/${gemstone?.slug || gemstone?._id}`;
    const shareData = {
      title: gemstone?.name?.english || 'Gemstone',
      text: gemstone?.summary || `Beautiful ${gemstone?.category}`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success('Link copied to clipboard!');
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
    const wasInWishlist = isInWishlist(gemstone?._id);
    toggleWishlist(gemstone);
    if (wasInWishlist) {
      toast.wishlistRemove(gemstone);
    } else {
      toast.wishlistAdd(gemstone);
    }
  };

  const handleAddToCartToggle = () => {
    const result = addToCart(gemstone);
    if (result?.success) {
      toast.cartAdd(gemstone);
    } else if (result?.message) {
      toast.error(result.message);
    }
  };

  const handleInstantCheckout = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to purchase online');
      navigate('/signin', { state: { from: `/gemstone/${slug}` } });
      return;
    }
    
    if (!isInCart(gemstone._id)) {
      const result = addToCart(gemstone);
      if (!result?.success) {
        toast.error(result?.message || 'Failed to add item to cart');
        return;
      }
    }
    navigate('/checkout');
  };

  const images = gemstone?.images?.length > 0 
    ? gemstone.images 
    : [{ url: '/placeholder-gemstone.svg', alt: 'No image available' }];

  const tabs = [
    { id: 'details', label: 'Description & Story', icon: FileText },
    { id: 'astrology', label: 'Astrology & Planets', icon: Compass },
    { id: 'certification', label: 'Certification Detail', icon: BadgeCheck },
    { id: 'shipping', label: 'Care & Shipping', icon: Shield }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Opening Gemstone Vault...</p>
        </div>
      </div>
    );
  }

  if (error || !gemstone) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4 py-12 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-lg">
          <Gem className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-neutral-950 dark:text-neutral-50 mb-2">Gemstone Listing Not Found</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">{error || 'This gemstone may have been sold or is temporarily archived.'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-350 transition-colors text-xs font-bold"
            >
              Go Back
            </button>
            <Link 
              to="/" 
              className="px-6 py-2.5 bg-amber-500 text-neutral-900 font-bold rounded-xl hover:bg-amber-600 transition-colors text-xs"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Define reusable sections to avoid JSX code duplication between mobile and desktop flows
  const titlePriceSection = (
    <div className="space-y-4">
      {/* Product Title and Basic metadata */}
      <div>
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          <span className="bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
            {gemstone.category}
          </span>
          <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
            {gemstone.color}
          </span>
          {gemstone.trending && (
            <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
              <Star className="w-3 h-3 fill-current text-purple-500" />
              <span>Trending</span>
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-neutral-50 tracking-tight mb-1">
          {gemstone.name?.english}
        </h1>
        
        {gemstone.name?.urdu && (
          <p className="text-xs font-semibold text-neutral-450 dark:text-neutral-500 italic mb-3">
            {gemstone.name.urdu}
          </p>
        )}

        {gemstone.summary && (
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-2xl">
            {gemstone.summary}
          </p>
        )}
      </div>

      {/* Price Display Block */}
      <div className="py-3 border-y border-neutral-200 dark:border-neutral-800/80">
        <span className="text-[9px] text-neutral-450 dark:text-neutral-500 uppercase font-bold tracking-wider block mb-1">Pricing &amp; Availability</span>
        
        {(gemstone?.price || (gemstone?.priceRange && (gemstone.priceRange.min || gemstone.priceRange.max))) ? (
          <div className="flex items-baseline gap-2.5">
            <span className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-neutral-50 leading-none">
              ₹
              {gemstone.price ? 
                gemstone.price.toLocaleString('en-IN') :
                gemstone.priceRange?.min && gemstone.priceRange?.max ? 
                  `${gemstone.priceRange.min.toLocaleString('en-IN')} - ₹${gemstone.priceRange.max.toLocaleString('en-IN')}` :
                  gemstone.priceRange?.min ? 
                    `${gemstone.priceRange.min.toLocaleString('en-IN')}+` :
                    `Up to ₹${gemstone.priceRange.max.toLocaleString('en-IN')}`
              }
            </span>

            {gemstone.discount?.isActive && gemstone.discount?.percentage > 0 && gemstone.price && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 dark:text-neutral-500 line-through">
                  ₹{Math.round(gemstone.price / (1 - gemstone.discount.percentage / 100)).toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
                  {gemstone.discount.percentage}% OFF
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-lg font-bold text-neutral-550 dark:text-neutral-450">Contact for pricing details</div>
        )}
        
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
          *Prices of gemstones vary dynamically based on carat weight, clarity, cut grade, and certification body.
        </p>
      </div>
    </div>
  );

  const specsSection = (
    <div className="border-t border-neutral-100 dark:border-neutral-800/80 pt-3">
      <span className="text-[9px] text-neutral-450 dark:text-neutral-500 uppercase font-bold tracking-wider block mb-2">Product Specifications</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
        {/* Color Spec */}
        <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800/40 text-xs">
          <span className="text-neutral-500 dark:text-neutral-400 font-medium">Color</span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{gemstone.color}</span>
        </div>
        {/* Weight Spec */}
        {gemstone.weight && (
          <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800/40 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Weight</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{gemstone.weight.value} {gemstone.weight.unit}</span>
          </div>
        )}
        {/* Traditional Ratti Spec */}
        {gemstone.ratti && (
          <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800/40 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Traditional Ratti</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{gemstone.ratti} Ratti</span>
          </div>
        )}
        {/* Mine Origin Spec */}
        {gemstone.origin && (
          <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800/40 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Mine Origin</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{gemstone.origin}</span>
          </div>
        )}
        {/* Dimensions Spec */}
        {gemstone.dimensions && (gemstone.dimensions.length || gemstone.dimensions.width) && (
          <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800/40 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Dimensions</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {gemstone.dimensions.length || 0}x{gemstone.dimensions.width || 0}x{gemstone.dimensions.height || 0} {gemstone.dimensions.unit || 'mm'}
            </span>
          </div>
        )}
        {/* Availability Spec */}
        <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800/40 text-xs">
          <span className="text-neutral-500 dark:text-neutral-400 font-medium">Availability</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{gemstone.availability || 'In Stock'}</span>
        </div>
      </div>
    </div>
  );

  const purchaseDrawerSection = (
    <div className="space-y-2.5 bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl p-4 shadow-sm">
      {/* Promo messages */}
      {gemstone.discount?.isActive && gemstone.discount?.message && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
          <span className="text-sm">🎁</span>
          <span>{gemstone.discount.message}</span>
        </div>
      )}

      {/* Secure Online Payment Checkout Option */}
      <button
        onClick={handleInstantCheckout}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-neutral-900 font-bold py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-md shadow-amber-500/10 active:scale-98 mb-2"
      >
        <ShoppingCart className="w-4.5 h-4.5 text-neutral-900" />
        <span>Buy Now (Online Checkout)</span>
      </button>

      <button
        onClick={handleWhatsAppClick}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 text-xs shadow-sm mb-3"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Inquire / Purchase via WhatsApp</span>
      </button>
      
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={handleAddToCartToggle}
          className={`py-2 rounded-xl font-bold transition-all duration-300 border flex items-center justify-center gap-1.5 text-xs ${
            isInCart(gemstone._id)
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
              : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700/60'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{isInCart(gemstone._id) ? 'In Cart' : 'Add to Cart'}</span>
        </button>
        
        <button
          onClick={handleWishlistToggle}
          className={`py-2 rounded-xl font-bold transition-all duration-300 border flex items-center justify-center gap-1.5 text-xs ${
            isInWishlist(gemstone._id)
              ? 'bg-rose-500 border-rose-500 text-white shadow shadow-rose-500/10'
              : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700/60'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isInWishlist(gemstone._id) ? 'fill-current' : ''}`} />
          <span>{isInWishlist(gemstone._id) ? 'Saved' : 'Save'}</span>
        </button>
      </div>
    </div>
  );

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
      
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20">
        
        {/* Detail Sub Header / Navigation helper */}
        <div className="border-b border-neutral-200 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/85 sticky top-0 z-40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Showroom</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60"
                title="Share Gemstone"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`p-2 transition-colors rounded-xl border ${
                  isInWishlist(gemstone._id) 
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-550 text-neutral-500 border-neutral-200 dark:border-neutral-700/60 hover:text-rose-500'
                }`}
                title="Save Favorite"
              >
                <Heart className={`w-4 h-4 ${isInWishlist(gemstone._id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Presentation Grid */}
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Column 1: Image Gallery & Mobile Details Flow (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Primary Image Display Box (Fully stretched on mobile) */}
              <div className="relative w-full aspect-square max-h-[320px] sm:max-h-[420px] md:max-h-none md:aspect-square bg-neutral-100 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm group flex items-center justify-center">
                <img
                  src={images[currentImageIndex]?.url}
                  alt={images[currentImageIndex]?.alt || gemstone.name?.english}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                  onError={(e) => {
                    e.target.src = '/placeholder-gemstone.svg';
                  }}
                />
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-neutral-800 transition-all text-neutral-800 dark:text-neutral-200"
                    >
                      <ChevronLeft className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-neutral-800 transition-all text-neutral-800 dark:text-neutral-200"
                    >
                      <ChevronRight className="w-4.5 h-4.5" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Image Thumbnails Horizontal Row */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                  {images.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex 
                          ? 'border-amber-500 scale-95 shadow-sm' 
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt || `${gemstone.name?.english} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-gemstone.svg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* MOBILE FLOW: Title, price, and CTA buttons immediately below the image gallery */}
              <div className="block lg:hidden space-y-4">
                {titlePriceSection}
                {purchaseDrawerSection}
              </div>

              {/* Lab Certification Box (Left column, under image showcase / mobile buy buttons) */}
              {gemstone.certification?.certified && (
                <div className="bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between gap-3.5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-55">Government Lab Certified</h4>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-450 mt-0.5">
                        Lab Body: {gemstone.certification.certifyingBody || 'Standard Approved Gem Laboratory'}
                      </p>
                    </div>
                  </div>
                  {gemstone.certification.certificationImage?.url && (
                    <button
                      onClick={() => setShowCertImage(true)}
                      className="bg-neutral-950 hover:bg-neutral-900 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-neutral-900 text-[10px] font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>View Lab Doc</span>
                    </button>
                  )}
                </div>
              )}

              {/* MOBILE FLOW: Specifications sheet below certification card */}
              <div className="block lg:hidden">
                {specsSection}
              </div>
            </div>

            {/* Column 2: Desktop Info & Purchase Flow (7 cols) */}
            <div className="lg:col-span-7 space-y-5 hidden lg:block">
              {titlePriceSection}
              {specsSection}
              {purchaseDrawerSection}
            </div>
          </div>

          {/* Interactive Info Tabs Panel */}
          <div className="mt-8 lg:mt-12 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-2xl overflow-hidden shadow-sm">
            
            {/* Tabs List */}
            <div className="flex border-b border-neutral-250 dark:border-neutral-800 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                const isTabActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-3 px-2 text-xs font-semibold transition-all border-b-2
                      ${isTabActive 
                        ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/[0.02]' 
                        : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-250 hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50'
                      }
                    `}
                  >
                    <TabIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
 
            {/* Tab Panels Contents */}
            <div className="p-4 sm:p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="prose dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-350 text-xs leading-relaxed"
                >
                  {/* Details Tab */}
                  {activeTab === 'details' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">About This Gemstone</h3>
                        <p className="whitespace-pre-wrap">{gemstone.description}</p>
                      </div>
                      
                      {gemstone.uses && (
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">Recommended Uses</h3>
                          <p className="whitespace-pre-wrap">{gemstone.uses}</p>
                        </div>
                      )}
                    </div>
                  )}
 
                  {/* Astrology Tab */}
                  {activeTab === 'astrology' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">Astrological Benefits &amp; Energy</h3>
                        {gemstone.astrologyBenefits ? (
                          <p className="whitespace-pre-wrap">{gemstone.astrologyBenefits}</p>
                        ) : (
                          <p>This natural, premium {gemstone.category} is believed to transmit beneficial cosmic rays, magnifying positive energetic effects. Please consult with our in-house astrologer or your family astrologer to align planetary configurations.</p>
                        )}
                      </div>
 
                      {gemstone.purpose && gemstone.purpose.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">Suitable Astrological Targets</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {gemstone.purpose.map((purp, idx) => (
                              <span key={idx} className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider">
                                {purp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
 
                  {/* Certification Tab */}
                  {activeTab === 'certification' && (
                    <div className="space-y-4">
                      <div className="bg-amber-500/[0.01] border border-amber-500/10 rounded-xl p-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-amber-500" />
                          <span>Certification Details</span>
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-neutral-450 block text-[10px]">Certifying Authority</span>
                            <span className="text-neutral-800 dark:text-neutral-200 font-semibold">{gemstone.certification?.certifyingBody || 'Govt Registered Lab Body'}</span>
                          </div>
                          <div>
                            <span className="text-neutral-450 block text-[10px]">Certificate Number</span>
                            <span className="text-neutral-800 dark:text-neutral-200 font-mono font-semibold">{gemstone.certification?.certificateNumber || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-neutral-455 block text-[10px]">Authentication Status</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <BadgeCheck className="w-4 h-4 fill-current" />
                              <span>100% Inspected &amp; Verified Natural</span>
                            </span>
                          </div>
                        </div>
                      </div>
 
                      {gemstone.certification?.certificationImage?.url && (
                        <div className="text-center pt-1">
                          <button
                            onClick={() => setShowCertImage(true)}
                            className="inline-flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 px-4 py-2 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 transition-all shadow-sm"
                          >
                            <Maximize2 className="w-3.5 h-3.5 text-amber-500" />
                            <span>Expand Certificate Document</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
 
                  {/* Shipping and Care Tab */}
                  {activeTab === 'shipping' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">Free Secure Insured Shipping</h4>
                          <p className="text-neutral-500 dark:text-neutral-400">
                            We dispatch our valuable gemstones through top logistics partners (BlueDart, FedEx, DTDC) with completely insured transit. Transit normally takes 2-4 business days inside India.
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">Cleaning &amp; Care Tips</h4>
                          <p className="text-neutral-500 dark:text-neutral-400">
                            Avoid contact with hash cosmetics, perfumes, or acids. Clean with lukewarm water and a soft toothbrush. Store in separate soft velvet pouches to prevent scratches.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Related/Similar Gemstones Showroom */}
          {relatedGemstones.length > 0 && (
            <div className="mt-16 sm:mt-24">
              <h2 className="text-xl sm:text-2xl font-heading font-semibold text-neutral-950 dark:text-neutral-50 mb-6 flex items-center gap-2">
                <Gem className="w-6 h-6 text-amber-500" />
                <span>Similar {gemstone.category} Collections</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
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

      {/* Lab Certification Document Preview Modal */}
      {showCertImage && gemstone?.certification?.certificationImage?.url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setShowCertImage(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-3xl max-h-[85vh] bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCertImage(false)}
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-neutral-950/60 hover:bg-neutral-950 text-white rounded-full flex items-center justify-center transition-all shadow"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <BadgeCheck className="w-6 h-6 text-emerald-500" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-50">Certificate of Authenticity</h3>
                <p className="text-[10px] text-neutral-400">Authority: {gemstone.certification.certifyingBody}</p>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh] flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-2 rounded-2xl">
              <img
                src={gemstone.certification.certificationImage.url}
                alt="Certificate Document"
                className="w-full h-auto max-h-[55vh] object-contain rounded-lg"
              />
            </div>
            
            <div className="mt-4 text-center text-xs font-semibold text-neutral-400 dark:text-neutral-500">
              Certificate Number: <span className="font-mono text-neutral-800 dark:text-neutral-250 font-bold">#{gemstone.certification.certificateNumber}</span>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Mobile Sticky Action Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-neutral-900/95 border-t border-neutral-200 dark:border-neutral-800/80 p-3 shadow-2xl backdrop-blur-md md:hidden flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img
                src={images[0]?.url || '/placeholder-gemstone.svg'}
                alt={gemstone.name?.english}
                className="w-10 h-10 object-cover rounded-lg border border-neutral-100 dark:border-neutral-800 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-50 truncate leading-tight">
                  {gemstone.name?.english}
                </h4>
                
                {(gemstone?.price || (gemstone?.priceRange && (gemstone.priceRange.min || gemstone.priceRange.max))) ? (
                  <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-450 mt-0.5">
                    ₹
                    {gemstone.price ? 
                      gemstone.price.toLocaleString('en-IN') :
                      gemstone.priceRange?.min ? 
                        gemstone.priceRange.min.toLocaleString('en-IN') :
                        gemstone.priceRange?.max?.toLocaleString('en-IN')
                    }
                  </p>
                ) : (
                  <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mt-0.5">Inquire price</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleWishlistToggle}
                className={`p-2.5 rounded-xl border transition-all ${
                  isInWishlist(gemstone._id)
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-550 border-neutral-205 dark:border-neutral-700/60'
                }`}
                aria-label="Wishlist toggle"
              >
                <Heart className={`w-4 h-4 ${isInWishlist(gemstone._id) ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleWhatsAppClick}
                className="p-2.5 bg-emerald-100 hover:bg-emerald-250 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all"
                title="Inquire via WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={handleInstantCheckout}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-neutral-900 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-amber-500/10 transition-all active:scale-95"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-neutral-900" />
                <span>Buy Now</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GemstoneDetail;