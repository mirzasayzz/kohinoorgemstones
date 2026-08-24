import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ZoomIn, 
  Download,
  Share2,
  Maximize2
} from 'lucide-react';

const ImageGallery = ({ 
  images = [], 
  gemstone = {}, 
  className = "" 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState({});
  
  const galleryRef = useRef(null);
  const fullscreenRef = useRef(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Process images with fallback
  const processedImages = images.length > 0 
    ? images.map(img => ({
        url: img.url || img,
        alt: img.alt || `${gemstone?.name?.english} - ${gemstone?.name?.urdu}`,
        caption: img.caption || ''
      }))
    : [{
        url: '/placeholder-gemstone.svg',
        alt: `${gemstone?.name?.english} - ${gemstone?.name?.urdu}`,
        caption: 'No image available'
      }];

  const currentImage = processedImages[currentIndex];

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex(prev => 
      prev === 0 ? processedImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(prev => 
      prev === processedImages.length - 1 ? 0 : prev + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isFullscreen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          setIsFullscreen(false);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  // Auto-advance for single image (disabled for multiple images)
  useEffect(() => {
    if (processedImages.length <= 1) return;
    
    const interval = setInterval(() => {
      if (!isFullscreen) {
        goToNext();
      }
    }, 5000); // Auto-advance every 5 seconds

    return () => clearInterval(interval);
  }, [currentIndex, isFullscreen, processedImages.length]);

  // Image loading handler
  const handleImageLoad = (index) => {
    setIsImageLoaded(prev => ({
      ...prev,
      [index]: true
    }));
  };

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: `${gemstone?.name?.english} - Kohinoor Gemstone`,
      text: `Check out this beautiful ${gemstone?.category} from Kohinoor Gemstone`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        // You could add a toast notification here
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  // Main Gallery Component
  const MainGallery = () => (
    <div className={`relative ${className}`}>
      
      {/* Main Image Container */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
        
        {/* Loading State */}
        {!isImageLoaded[currentIndex] && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 animate-pulse flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <ZoomIn className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        )}

        {/* Main Image */}
        <motion.img
          key={currentIndex}
          src={currentImage.url}
          alt={currentImage.alt}
          onLoad={() => handleImageLoad(currentIndex)}
          onError={(e) => {
            console.error('Image failed to load:', currentImage.url);
            console.error('Error event:', e);
          }}
          className="w-full h-full object-cover cursor-zoom-in"
          onClick={() => setIsFullscreen(true)}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {/* Navigation Arrows - Desktop Only */}
        {processedImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="hidden md:flex absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={goToNext}
              className="hidden md:flex absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {processedImages.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {processedImages.length}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-2 right-2 flex space-x-2">
          <button
            onClick={handleShare}
            className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            aria-label="Share image"
          >
            <Share2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsFullscreen(true)}
            className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            aria-label="View fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Thumbnail Strip - Mobile Horizontal Scroll */}
      {processedImages.length > 1 && (
        <div className="mt-4">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {processedImages.map((image, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`
                  flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200
                  ${index === currentIndex 
                    ? 'border-sapphire dark:border-golden shadow-lg scale-105' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }
                `}
              >
                <img
                  src={image.url}
                  alt={`${image.alt} thumbnail`}
                  onError={(e) => {
                    console.error('Thumbnail failed to load:', image.url);
                  }}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Swipe Indicators */}
      {processedImages.length > 1 && (
        <div className="md:hidden mt-4 flex justify-center space-x-2">
          {processedImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                w-2 h-2 rounded-full transition-all duration-200
                ${index === currentIndex 
                  ? 'bg-sapphire dark:bg-golden w-6' 
                  : 'bg-gray-300 dark:bg-gray-600'
                }
              `}
            />
          ))}
        </div>
      )}
    </div>
  );

  // Fullscreen Modal
  const FullscreenModal = () => (
    <AnimatePresence>
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black"
          ref={fullscreenRef}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-60 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Container */}
          <div className="flex items-center justify-center h-full p-4">
            <div className="relative max-w-full max-h-full">
              <img
                src={currentImage.url}
                alt={currentImage.alt}
                className="max-w-full max-h-full object-contain"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
              
              {/* Navigation in Fullscreen */}
              {processedImages.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="text-center text-white">
              <h3 className="font-heading text-xl font-bold mb-2">
                {gemstone?.name?.english}
              </h3>
              {gemstone?.name?.urdu && (
                <p className="text-gray-300 mb-2">{gemstone.name.urdu}</p>
              )}
              {currentImage.caption && (
                <p className="text-sm text-gray-400">{currentImage.caption}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <MainGallery />
      <FullscreenModal />
    </>
  );
};

export default ImageGallery; 