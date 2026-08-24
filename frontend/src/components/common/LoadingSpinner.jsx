import { motion } from 'framer-motion';
import { Gem, Sparkles } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'medium', 
  variant = 'primary', 
  message = 'Loading...',
  className = "",
  showMessage = true 
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      container: 'w-8 h-8',
      gem: 'w-6 h-6',
      sparkle: 'w-3 h-3',
      text: 'text-sm'
    },
    medium: {
      container: 'w-12 h-12',
      gem: 'w-8 h-8',
      sparkle: 'w-4 h-4',
      text: 'text-base'
    },
    large: {
      container: 'w-16 h-16',
      gem: 'w-12 h-12',
      sparkle: 'w-6 h-6',
      text: 'text-lg'
    }
  };

  // Variant configurations
  const variantConfig = {
    primary: {
      gem: 'text-sapphire',
      sparkle: 'text-golden',
      text: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-sapphire/10'
    },
    secondary: {
      gem: 'text-emerald-500',
      sparkle: 'text-ruby',
      text: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-emerald/10'
    },
    accent: {
      gem: 'text-golden',
      sparkle: 'text-sapphire',
      text: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-golden/10'
    }
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  // Animation variants
  const gemRotateVariants = {
    animate: {
      rotate: [0, 360],
      scale: [1, 1.1, 1],
      transition: {
        rotate: {
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        },
        scale: {
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    }
  };

  const sparkleVariants = {
    animate: {
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        staggerChildren: 0.2
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      
      {/* Main Loading Animation */}
      <div className="relative flex items-center justify-center">
        
        {/* Pulsing Background */}
        <motion.div
          variants={pulseVariants}
          animate="animate"
          className={`absolute rounded-full ${currentSize.container} ${currentVariant.bg}`}
        />
        
        {/* Central Gem */}
        <motion.div
          variants={gemRotateVariants}
          animate="animate"
          className={`relative z-10 ${currentVariant.gem}`}
        >
          <Gem className={currentSize.gem} />
        </motion.div>
        
        {/* Orbiting Sparkles */}
        <motion.div
          variants={sparkleVariants}
          animate="animate"
          className="absolute inset-0"
        >
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: '0 0'
              }}
              animate={{
                rotate: [0 + i * 90, 360 + i * 90],
                x: [0, size === 'large' ? 30 : size === 'medium' ? 24 : 18],
                transition: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.2
                }
              }}
            >
              <Sparkles className={`${currentSize.sparkle} ${currentVariant.sparkle}`} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Loading Message */}
      {showMessage && message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`${currentSize.text} ${currentVariant.text} font-medium text-center`}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

// Skeleton Loader for Cards
export const GemstoneCardSkeleton = ({ variant = 'grid', className = "" }) => {
  return (
    <div className={`premium-card animate-pulse ${className}`}>
      {/* Image Skeleton */}
      <div className={`${variant === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square w-full'} bg-gray-200 dark:bg-gray-600`}></div>
      
      {/* Content Skeleton */}
      <div className="p-3 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded-full w-12"></div>
        </div>
      </div>
    </div>
  );
};

// Page Loading Overlay
export const PageLoader = ({ message = "Loading Kohinoor..." }) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="large" message={message} />
        
        {/* Loading Progress Dots */}
        <div className="flex items-center justify-center space-x-2 mt-8">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-sapphire"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Inline Loading for Content Sections
export const InlineLoader = ({ 
  lines = 3, 
  className = "",
  variant = 'full' // 'full', 'compact'
}) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 dark:bg-gray-600 rounded ${
            variant === 'compact' 
              ? i === lines - 1 ? 'w-2/3' : 'w-full'
              : i === 0 ? 'w-3/4' : i === lines - 1 ? 'w-1/2' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner; 