import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gem, ImageIcon, AlertCircle } from 'lucide-react';

const LazyImage = ({
  src,
  alt = "",
  className = "",
  placeholderClassName = "",
  containerClassName = "",
  fallbackSrc = "/placeholder-gemstone.svg",
  onLoad = () => {},
  onError = () => {},
  threshold = 0.1,
  rootMargin = "50px",
  enableTransition = true,
  aspectRatio = "square", // 'square', 'video', 'auto', 'portrait'
  quality = 'auto',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Aspect ratio classes
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video', 
    portrait: 'aspect-[3/4]',
    auto: ''
  };

  // Cloudinary optimization
  const optimizeImageUrl = (url) => {
    if (!url || typeof url !== 'string') {
      console.log('LazyImage: Invalid URL provided:', url);
      return fallbackSrc;
    }
    
    // If it's already a Cloudinary URL, add optimizations
    if (url.includes('cloudinary.com')) {
      const cloudinaryParams = [
        'f_auto', // Auto format
        'q_auto', // Auto quality
        quality !== 'auto' ? `q_${quality}` : '',
        'dpr_auto', // Auto DPR
        'c_fill', // Fill mode
        'g_auto' // Auto gravity
      ].filter(Boolean).join(',');
      
      // Insert the transformation parameters into the Cloudinary URL
      const optimizedUrl = url.replace(
        '/upload/',
        `/upload/${cloudinaryParams}/`
      );
      
      console.log('LazyImage: Optimized Cloudinary URL:', { original: url, optimized: optimizedUrl });
      return optimizedUrl;
    }
    
    // For non-Cloudinary URLs, return as-is
    console.log('LazyImage: Using non-Cloudinary URL:', url);
    return url;
  };

  // Intersection Observer setup
  useEffect(() => {
    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin]);

  // Handle image loading
  useEffect(() => {
    if (!isInView || !src) return;

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
      onLoad();
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
      onError();
    };

    img.src = optimizeImageUrl(src);

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isInView, src, onLoad, onError]);

  // Loading placeholder component
  const LoadingPlaceholder = () => (
    <div className={`
      absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 
      flex items-center justify-center ${placeholderClassName}
    `}>
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1] 
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="text-gray-400"
      >
        <Gem className="w-8 h-8" />
      </motion.div>
    </div>
  );

  // Error placeholder component
  const ErrorPlaceholder = () => (
    <div className={`
      absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 
      flex flex-col items-center justify-center text-red-400 ${placeholderClassName}
    `}>
      <AlertCircle className="w-8 h-8 mb-2" />
      <span className="text-xs text-center px-2">
        Failed to load image
      </span>
    </div>
  );

  // Blur placeholder (base64 encoded tiny image)
  const blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLDek2jqvVGgX0bUpnrPRd3sH2qDPbDMiJkA4FLbXCf0nWF6kC8cJELPTdCQGNHXTCLNVJDPGnDNtO3U8IIjQ2wgjdEFCKD1wS5U8IxSm5HvtCM3vbtTa/s+1R8xvO+qHZ7HjJWGPOyIpIbKtJqQDBAT+VVxEHI8aB4t1YCIxJHv8ARPLOl5r1Qxqf+oFaAB0H//Z";

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${aspectRatioClasses[aspectRatio]} ${containerClassName}`}
    >
      {/* Blur placeholder background */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-sm scale-110"
        style={{ backgroundImage: `url(${blurDataURL})` }}
      />

      {/* Loading state */}
      {isLoading && <LoadingPlaceholder />}

      {/* Error state */}
      {hasError && <ErrorPlaceholder />}

      {/* Main image */}
      {isInView && !hasError && (
        <motion.img
          src={optimizeImageUrl(isLoaded ? src : fallbackSrc)}
          alt={alt}
          className={`
            absolute inset-0 w-full h-full object-cover
            ${className}
            ${enableTransition ? 'transition-opacity duration-500' : ''}
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          initial={enableTransition ? { opacity: 0, scale: 1.1 } : false}
          animate={enableTransition && isLoaded ? { opacity: 1, scale: 1 } : false}
          transition={{ duration: 0.6, ease: "easeOut" }}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}

      {/* Progressive enhancement: Show higher quality after initial load */}
      {isLoaded && quality !== 'auto' && (
        <img
          src={optimizeImageUrl(src)}
          alt={alt}
          className={`
            absolute inset-0 w-full h-full object-cover
            transition-opacity duration-1000 opacity-0
          `}
          onLoad={(e) => {
            e.target.classList.remove('opacity-0');
            e.target.classList.add('opacity-100');
          }}
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Optional overlay for better text readability */}
      {props.overlay && (
        <div className={`absolute inset-0 ${props.overlay}`} />
      )}
    </div>
  );
};

// Preset configurations for common use cases
export const GemstoneImage = (props) => (
  <LazyImage
    aspectRatio="square"
    quality="80"
    className="hover:scale-105 transition-transform duration-300"
    {...props}
  />
);

export const HeroImage = (props) => (
  <LazyImage
    aspectRatio="video"
    quality="90"
    rootMargin="100px"
    {...props}
  />
);

export const ThumbnailImage = (props) => (
  <LazyImage
    aspectRatio="square"
    quality="70"
    enableTransition={false}
    {...props}
  />
);

// Preload function for critical images
export const preloadImage = (src) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
};

export default LazyImage; 