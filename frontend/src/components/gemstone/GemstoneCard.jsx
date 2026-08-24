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
  Info
} from 'lucide-react';
import { useBusinessContext } from '../../context/BusinessContext';
import { useWishlist } from '../../context/WishlistContext';
import { GemstoneImage } from '../common/LazyImage';
import { useToast } from '../common/Toast';

const GemstoneCard = ({ gemstone, index = 0, variant = 'grid' }) => {
  const { generateWhatsAppURL, shareGemstoneWithImage } = useBusinessContext();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showWishlistAdd, showWishlistRemove } = useToast();
  const [isHovered, setIsHovered] = useState(false);

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
          navigator.share({
            title: `${gemstone?.name?.english} - ${gemstone?.name?.urdu}`,
            text: gemstone?.summary || `Check out this beautiful ${gemstone?.category} gemstone from Kohinoor.`,
            url: window.location.origin + `/gemstone/${gemstone?.slug || gemstone?._id}`
          });
        } else {
          navigator.clipboard.writeText(window.location.origin + `/gemstone/${gemstone?.slug || gemstone?._id}`);
        }
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      navigator.clipboard.writeText(window.location.origin + `/gemstone/${gemstone?.slug || gemstone?._id}`);
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
      showWishlistRemove(gemstone);
    } else {
      showWishlistAdd(gemstone);
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        delay: index * 0.1,
        ease: "easeOut"
      }
    },
    hover: {
      y: -12,
      scale: 1.03,
      rotateY: 2,
      transition: {
        duration: 0.3,
        ease: "easeOut"
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
      backdropFilter: "blur(0px)"
    },
    visible: {
      opacity: 1,
      backdropFilter: "blur(4px)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const actionButtonVariants = {
    hidden: {
      scale: 0,
      rotate: -180,
      opacity: 0
    },
    visible: (i) => ({
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: "backOut"
      }
    })
  };

  const fallbackImage = '/placeholder-gemstone.svg';
  const imageUrl = gemstone?.images?.[0]?.url || fallbackImage;
  
  if (gemstone && (!gemstone.images || gemstone.images.length === 0)) {
    console.log('Gemstone missing images:', gemstone.name?.english, gemstone.images);
  }

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
        premium-card overflow-hidden group cursor-pointer transform-gpu
        ${variant === 'featured' ? 'md:col-span-2 md:row-span-2' : ''}
        ${variant === 'list' ? 'flex flex-row' : 'flex flex-col'}
        ${isHovered ? 'shadow-2xl' : 'shadow-md'}
      `}
    >
      <Link to={`/gemstone/${gemstone?.slug || gemstone?._id}`} className="block h-full">
        
        {/* Image */}
        <div className={`
          relative overflow-hidden group/image
          ${variant === 'list' ? 'w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0' : 'aspect-square w-full'}
          ${variant === 'featured' ? 'md:aspect-[2/1]' : ''}
        `}>
          
          {/* Trending Badge */}
          {gemstone?.trending && (
            <motion.div 
              className="absolute top-2 left-2 z-10"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <div className="bg-ruby text-white px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold flex items-center space-x-1 shadow-lg backdrop-blur-sm">
                <TrendingUp className="w-3 h-3" />
                <span>Trending</span>
              </div>
            </motion.div>
          )}

          {/* Featured Badge */}
          {variant === 'featured' && (
            <motion.div 
              className="absolute top-2 right-2 z-10"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <div className="bg-golden text-sapphire px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold flex items-center space-x-1 shadow-lg backdrop-blur-sm">
                <Star className="w-3 h-3" />
                <span>Featured</span>
              </div>
            </motion.div>
          )}

          {/* Image */}
          <GemstoneImage
            src={gemstone?.images?.[0]?.url}
            alt={`${gemstone?.name?.english} - ${gemstone?.name?.urdu}`}
            containerClassName="w-full h-full"
            className="group-hover:scale-110 transition-transform duration-500 ease-out"
            quality="85"
          />

          {/* Mobile Action Bar */}
          <motion.div 
            className="md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-2.5 sm:p-3 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              {/* Left side - Share & Wishlist */}
              <div className="flex items-center space-x-2">
                {/* Share Button */}
                <motion.button
                  onClick={handleShare}
                  whileTap={{ scale: 0.9 }}
                  className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full shadow-lg hover:bg-white/30 transition-colors"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </motion.button>

                {/* Wishlist Button */}
                <motion.button
                  onClick={handleWishlist}
                  whileTap={{ scale: 0.9 }}
                  className={`backdrop-blur-sm text-white p-2 rounded-full shadow-lg transition-colors ${
                    isInWishlist(gemstone?._id) 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                  title={isInWishlist(gemstone?._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(gemstone?._id) ? 'fill-current' : ''}`} />
                </motion.button>
              </div>

              {/* Right side - Buy Now */}
              <motion.button
                onClick={handleWhatsAppClick}
                whileTap={{ scale: 0.95 }}
                className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-full shadow-lg hover:bg-green-600 transition-colors backdrop-blur-sm flex items-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-[11px] sm:text-xs font-medium">Buy Now</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Desktop Hover Overlay */}
          <motion.div 
            className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
            variants={overlayVariants}
            initial="hidden"
            whileHover="visible"
          >
            {/* Action Buttons */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial="hidden"
              whileHover="visible"
            >
              <div className="flex items-center space-x-3">
                {[
                  { icon: Eye, color: 'bg-sapphire hover:bg-sapphire/90', label: 'Quick View' },
                  { icon: MessageCircle, color: 'bg-green-500 hover:bg-green-600', label: 'WhatsApp', onClick: handleWhatsAppClick },
                  { icon: Share2, color: 'bg-golden hover:bg-golden/90', label: 'Share', onClick: handleShare }
                ].map((action, i) => (
                  <motion.button
                    key={action.label}
                    custom={i}
                    variants={actionButtonVariants}
                    onClick={action.onClick || (() => {})}
                    className={`${action.color} text-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    title={action.label}
                  >
                    <action.icon className="w-4 h-4" />
                  </motion.button>
                ))}
                
                {/* Wishlist Button */}
                <motion.button
                  custom={3}
                  variants={actionButtonVariants}
                  onClick={handleWishlist}
                  className={`text-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${
                    isInWishlist(gemstone?._id) 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-ruby hover:bg-ruby/90'
                  }`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  title={isInWishlist(gemstone?._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(gemstone?._id) ? 'fill-current' : ''}`} />
                </motion.button>
              </div>
            </motion.div>

            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent h-20" />
          </motion.div>

          {/* View Count */}
          {gemstone?.viewCount > 0 && (
            <motion.div 
              className="absolute bottom-2 left-2 z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="bg-black/60 text-white px-2 py-1 rounded-full text-[10px] sm:text-xs flex items-center space-x-1 backdrop-blur-sm">
                <Eye className="w-3 h-3" />
                <span>{gemstone.viewCount.toLocaleString()}</span>
              </div>
            </motion.div>
          )}

          {/* Certified */}
          {gemstone?.certification?.certified && (
            <motion.div
              className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold flex items-center space-x-1 shadow-lg backdrop-blur-sm">
                <Award className="w-3 h-3" />
                <span>Certified</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className={`
          p-2.5 sm:p-3 flex-grow flex flex-col
          ${variant === 'list' ? 'justify-center ml-3 sm:ml-4' : ''}
        `}>
          
          {/* Names */}
          <div className="mb-1.5 sm:mb-2">
            <h3 className={`
              font-heading font-semibold text-gray-900 dark:text-white mb-0.5
              ${variant === 'featured' ? 'text-base sm:text-lg md:text-xl' : 'text-sm md:text-base'}
              line-clamp-1
            `}>
              {gemstone?.name?.english}
            </h3>
            <p className={`
              text-gray-600 dark:text-gray-400 font-medium
              ${variant === 'featured' ? 'text-xs sm:text-sm md:text-base' : 'text-[11px] sm:text-xs md:text-sm'}
              line-clamp-1
            `}>
              {gemstone?.name?.urdu}
            </p>
          </div>

          {/* Summary */}
          {variant === 'featured' && gemstone?.summary && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2.5 line-clamp-2">
              {gemstone.summary}
            </p>
          )}

          {/* Category/Color */}
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="bg-emerald/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium">
              {gemstone?.category}
            </span>
            <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
              {gemstone?.color}
            </span>
          </div>

          {/* Purpose Tags */}
          {gemstone?.purpose && gemstone.purpose.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {gemstone.purpose.slice(0, variant === 'list' ? 1 : 2).map((purpose, index) => (
                <span
                  key={index}
                  className="bg-golden/10 text-golden-700 dark:text-golden-400 px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium"
                >
                  {purpose}
                </span>
              ))}
              {gemstone.purpose.length > 2 && variant !== 'list' && (
                <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                  +{gemstone.purpose.length - 2} more
                </span>
              )}
            </div>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center justify-between mt-auto pt-2">
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              {gemstone?.certification?.certified && (
                <div className="flex items-center space-x-1">
                  <Award className="w-3 h-3" />
                  <span>Certified</span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleWhatsAppClick}
              className="btn-whatsapp text-sm px-3 py-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default GemstoneCard; 