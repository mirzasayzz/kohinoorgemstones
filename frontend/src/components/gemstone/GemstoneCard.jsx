import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Eye, 
  Star, 
  MessageCircle,
  Sparkles,
  Award,
  TrendingUp,
  Gem,
  Share2,
  ShoppingCart,
  Zap,
  Info,
  Plus
} from 'lucide-react';
import { useBusinessContext } from '../../context/BusinessContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { GemstoneImage } from '../common/LazyImage';
import { useGlobalToast } from '../../context/ToastContext';
import { SITE_CONFIG } from '../../config/config';

const GemstoneCard = ({ gemstone, index = 0, variant = 'grid' }) => {
  const { generateWhatsAppURL, shareGemstoneWithImage } = useBusinessContext();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useGlobalToast();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    const result = addToCart(gemstone);
    if (result?.success) {
      toast.cartAdd(gemstone);
    } else if (result?.message) {
      toast.error(result.message);
    }
  };

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const shared = await shareGemstoneWithImage(gemstone);
      
      if (shared !== true) {
        if (navigator.share) {
          await navigator.share({
            title: `${gemstone?.name?.english} - ${gemstone?.name?.urdu}`,
            text: gemstone?.summary || `Check out this beautiful ${gemstone?.category} gemstone from Kohinoor.`,
            url: `${SITE_CONFIG.BASE_URL}/gemstone/${gemstone?.slug || gemstone?._id}`
          });
        } else {
          await navigator.clipboard.writeText(`${SITE_CONFIG.BASE_URL}/gemstone/${gemstone?.slug || gemstone?._id}`);
          toast.success('Link copied to clipboard!');
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        await navigator.clipboard.writeText(`${SITE_CONFIG.BASE_URL}/gemstone/${gemstone?.slug || gemstone?._id}`);
        toast.success('Link copied to clipboard!');
      }
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    const wasInWishlist = isInWishlist(gemstone?._id);
    toggleWishlist(gemstone);
    
    if (wasInWishlist) {
      toast.wishlistRemove(gemstone);
    } else {
      toast.wishlistAdd(gemstone);
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.98 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        delay: index * 0.05,
        ease: "easeOut"
      }
    },
    hover: {
      y: -8,
      transition: {
        duration: 0.25,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  const overlayVariants = {
    hidden: {
      opacity: 0,
      backdropFilter: "blur(0px)",
      backgroundColor: "rgba(0, 0, 0, 0)"
    },
    visible: {
      opacity: 1,
      backdropFilter: "blur(8px)",
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      transition: {
        duration: 0.25,
        ease: "easeOut"
      }
    }
  };

  const actionButtonVariants = {
    hidden: {
      scale: 0,
      opacity: 0
    },
    visible: (i) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.2,
        ease: "backOut"
      }
    })
  };

  const fallbackImage = '/placeholder-gemstone.svg';
  const imageUrl = gemstone?.images?.[0]?.url || fallbackImage;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        bg-white dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80
        rounded-2xl overflow-hidden group cursor-pointer transition-shadow duration-300 flex flex-col h-full
        ${variant === 'featured' ? 'md:col-span-2 md:row-span-2' : ''}
        ${isHovered ? 'shadow-xl border-neutral-200 dark:border-neutral-700' : 'shadow-sm'}
      `}
    >
      <Link 
        to={`/gemstone/${gemstone?.slug || gemstone?._id}`} 
        className={`flex w-full flex-grow ${variant === 'list' ? 'flex-row h-full' : 'flex-col'}`}
      >
        
        {/* Image Display */}
        <div className={`
          relative overflow-hidden bg-neutral-50 dark:bg-neutral-950/40 flex-shrink-0
          ${variant === 'list' ? 'w-36 h-full sm:w-44' : 'aspect-square w-full'}
          ${variant === 'featured' ? 'md:aspect-[1.5/1]' : ''}
        `}>
          
          {/* Badge overlays - elegant stack */}
          <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 z-20 flex flex-col gap-1 sm:gap-1.5 items-start">
            {/* Discount Badge */}
            {gemstone?.discount?.isActive && gemstone?.discount?.percentage > 0 && (
              <div className="bg-rose-500/90 dark:bg-rose-500/80 backdrop-blur-md text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 rounded-md sm:rounded-lg shadow-sm">
                {gemstone.discount.percentage}% OFF
              </div>
            )}

            {/* Trending Badge */}
            {gemstone?.trending && (
              <div className="bg-purple-600/90 dark:bg-purple-500/80 backdrop-blur-md text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 rounded-md sm:rounded-lg shadow-sm flex items-center gap-0.5 sm:gap-1">
                <TrendingUp className="w-2.5 h-2.5" />
                <span>Trending</span>
              </div>
            )}

            {/* Certified Badge */}
            {gemstone?.certification?.certified && (
              <div className="bg-amber-500/90 dark:bg-amber-500/80 backdrop-blur-md text-neutral-900 text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 rounded-md sm:rounded-lg shadow-sm flex items-center gap-0.5">
                <Award className="w-2.5 h-2.5 text-neutral-900" />
                <span>Certified</span>
              </div>
            )}
          </div>

          {/* Featured Badge */}
          {variant === 'featured' && (
            <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 z-20 bg-amber-500 text-neutral-900 px-1.5 py-0.5 sm:px-2 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-bold shadow-sm flex items-center gap-0.5 sm:gap-1">
              <Star className="w-2.5 h-2.5 fill-neutral-900 text-neutral-900" />
              <span>Featured</span>
            </div>
          )}

          {/* Product Image */}
          <GemstoneImage
            src={imageUrl}
            alt={`${gemstone?.name?.english} - ${gemstone?.name?.urdu}`}
            containerClassName="w-full h-full"
            className="group-hover:scale-105 transition-transform duration-700 ease-out object-cover"
            quality="85"
          />

          {/* Desktop Hover Overlay */}
          <motion.div 
            className="hidden md:flex absolute inset-0 items-center justify-center z-25"
            variants={overlayVariants}
            initial="hidden"
            animate={isHovered ? "visible" : "hidden"}
          >
            <div className="flex items-center space-x-2">
              {[
                { icon: Eye, color: 'bg-white/10 hover:bg-white/20 text-white border border-white/20', label: 'View Details' },
                { icon: ShoppingCart, color: 'bg-amber-500 hover:bg-amber-600 text-neutral-900', label: 'Add to Cart', onClick: handleAddToCart, active: isInCart(gemstone?._id) },
                { icon: MessageCircle, color: 'bg-green-500 hover:bg-green-600 text-white', label: 'WhatsApp Buy', onClick: handleWhatsAppClick }
              ].map((action, i) => (
                <motion.button
                  key={action.label}
                  custom={i}
                  variants={actionButtonVariants}
                  onClick={action.onClick || (() => {})}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 ${action.color} ${action.active ? 'ring-2 ring-emerald-400' : ''}`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  title={action.label}
                >
                  <action.icon className="w-4 h-4" />
                </motion.button>
              ))}
              
              {/* Desktop Wishlist Button inside overlay */}
              <motion.button
                custom={3}
                variants={actionButtonVariants}
                onClick={handleWishlist}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 ${
                  isInWishlist(gemstone?._id) 
                    ? 'bg-rose-500 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                title={isInWishlist(gemstone?._id) ? "Remove Wishlist" : "Save Wishlist"}
              >
                <Heart className={`w-4 h-4 ${isInWishlist(gemstone?._id) ? 'fill-current' : ''}`} />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Content Section */}
        <div className={`
          p-2 sm:p-4 flex-grow flex flex-col justify-between
          ${variant === 'list' ? 'ml-1 sm:ml-2' : ''}
        `}>
          {/* Header Area */}
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1 sm:mb-1.5">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-400/5 px-1.5 py-0.5 rounded">
                {gemstone?.category}
              </span>
              <span className="text-[9px] sm:text-[10px] text-neutral-450 dark:text-neutral-500 font-medium">
                {gemstone?.color}
              </span>
            </div>

            {/* Names & Price - Unified Same-Line Layout */}
            <div className="flex items-start justify-between gap-1.5 sm:gap-2.5 mb-0.5 sm:mb-1">
              <h3 className={`
                font-heading font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors
                ${variant === 'featured' ? 'text-base sm:text-xl md:text-2xl' : 'text-xs sm:text-base'}
                truncate flex-grow
              `}>
                {gemstone?.name?.english}
              </h3>
              
              {/* Price Block */}
              <div className="flex flex-col items-end flex-shrink-0 text-right">
                {gemstone?.discount?.isActive && gemstone?.discount?.percentage > 0 && gemstone.price ? (
                  <span className="text-[9px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 line-through font-medium leading-none mb-0.5">
                    ₹{Math.round(gemstone.price / (1 - gemstone.discount.percentage / 100)).toLocaleString('en-IN')}
                  </span>
                ) : null}
                
                {(gemstone?.price || (gemstone?.priceRange && (gemstone.priceRange.min || gemstone.priceRange.max))) ? (
                  <div className="font-bold text-emerald-600 dark:text-emerald-450 text-xs sm:text-base leading-none">
                    <span>₹</span>
                    <span>
                      {gemstone.price ? 
                        gemstone.price.toLocaleString('en-IN') :
                        gemstone.priceRange?.min ? 
                          gemstone.priceRange.min.toLocaleString('en-IN') :
                          gemstone.priceRange?.max?.toLocaleString('en-IN')
                      }
                    </span>
                  </div>
                ) : (
                  <span className="text-[9px] sm:text-[10px] font-bold text-neutral-400 dark:text-neutral-500 leading-none">Contact</span>
                )}
              </div>
            </div>
            
            {gemstone?.name?.urdu && (
              <p className="text-neutral-400 dark:text-neutral-500 text-[10px] sm:text-xs font-luxury italic mb-1 sm:mb-2 tracking-wide truncate">
                {gemstone.name.urdu}
              </p>
            )}

            {/* Specifications row - Weight & Origin */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-neutral-550 dark:text-neutral-400 font-medium mt-0.5 sm:mt-1">
              {gemstone?.weight?.value && (
                <span>{gemstone.weight.value} {gemstone.weight.unit || 'carats'}</span>
              )}
              {gemstone?.ratti && (
                <>
                  <span className="w-0.5 h-0.5 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
                  <span>{gemstone.ratti} ratti</span>
                </>
              )}
              {gemstone?.origin && (
                <>
                  <span className="w-0.5 h-0.5 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
                  <span className="truncate">{gemstone.origin}</span>
                </>
              )}
            </div>

            {/* Astrology zodiac / purposes tags - small pills */}
            <div className="flex items-center gap-1 mt-1.5 sm:mt-2.5 overflow-hidden flex-wrap max-h-5 sm:max-h-6">
              {gemstone?.purpose?.slice(0, 2).map((purp, i) => (
                <span key={i} className="text-[8px] sm:text-[9px] font-semibold bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-1.5 py-0.5 rounded border border-neutral-105 dark:border-neutral-800">
                  {purp}
                </span>
              ))}
              {gemstone?.purpose?.length > 2 && (
                <span className="text-[8px] sm:text-[9px] text-neutral-400 font-bold">+{gemstone.purpose.length - 2}</span>
              )}
            </div>
          </div>

          {/* Footer Area - Mobile Actions Only */}
          <div className="mt-auto pt-1.5 sm:pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-end gap-1 sm:gap-1.5 md:hidden">
            <button
              onClick={handleWishlist}
              className={`p-1.5 rounded-lg transition-all duration-300 ${
                isInWishlist(gemstone?._id)
                  ? 'bg-rose-500 text-white'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-500 hover:text-rose-500 border border-neutral-100 dark:border-neutral-800'
              }`}
              aria-label="Save Wishlist"
            >
              <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isInWishlist(gemstone?._id) ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleAddToCart}
              className={`p-1.5 rounded-lg transition-all duration-300 ${
                isInCart(gemstone?._id)
                  ? 'bg-amber-500 text-neutral-900 font-bold'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-500 hover:text-amber-500 border border-neutral-100 dark:border-neutral-800'
              }`}
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <button
              onClick={handleWhatsAppClick}
              className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-lg transition-colors duration-300 flex items-center justify-center shadow-sm"
              aria-label="Inquire via WhatsApp"
            >
              <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default GemstoneCard;