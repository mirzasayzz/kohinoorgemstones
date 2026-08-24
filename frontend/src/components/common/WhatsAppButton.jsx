import { useState } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBusinessContext } from '../../context/BusinessContext';

const WhatsAppButton = ({ 
  gemstone = null, 
  position = 'sticky', // 'sticky', 'inline', 'fixed'
  size = 'default', // 'small', 'default', 'large'
  className = "",
  customMessage = null
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { generateWhatsAppURL, businessInfo } = useBusinessContext();

  const handleWhatsAppClick = () => {
    const whatsappData = generateWhatsAppURL(gemstone, customMessage);
    
    // Use the enhanced open method with app preference and fallback
    if (whatsappData && whatsappData.open) {
      whatsappData.open();
    } else {
      // Fallback for older method (if any)
      const url = typeof whatsappData === 'string' ? whatsappData : whatsappData.webUrl;
      window.open(url, '_blank');
    }
  };

  // Size configurations
  const sizeConfig = {
    small: {
      button: 'px-4 py-2 text-sm',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    default: {
      button: 'px-6 py-3 text-base',
      icon: 'w-5 h-5',
      text: 'text-base'
    },
    large: {
      button: 'px-8 py-4 text-lg',
      icon: 'w-6 h-6',
      text: 'text-lg'
    }
  };

  // Position configurations
  const positionConfig = {
    // Sticky bottom for mobile, right for desktop
    sticky: {
      container: 'fixed bottom-4 left-4 right-4 md:bottom-6 md:right-6 md:left-auto md:w-auto z-40',
      button: 'w-full md:w-auto'
    },
    // Fixed position (always visible)
    fixed: {
      container: 'fixed bottom-6 right-6 z-40',
      button: ''
    },
    // Inline button (flows with content)
    inline: {
      container: 'relative',
      button: 'w-full'
    }
  };

  const currentSize = sizeConfig[size];
  const currentPosition = positionConfig[position];

  return (
    <div className={`${currentPosition.container} ${className}`}>
      <motion.button
        onClick={handleWhatsAppClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          ${currentPosition.button}
          ${currentSize.button}
          bg-green-500 hover:bg-green-600 
          text-white font-semibold rounded-lg
          shadow-lg hover:shadow-xl
          transition-all duration-200
          flex items-center justify-center space-x-2
          relative overflow-hidden
        `}
      >
        {/* Background Animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-500"
          initial={{ x: '-100%' }}
          animate={{ x: isHovered ? 0 : '-100%' }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Content */}
        <div className="relative flex items-center space-x-2 z-10">
          <MessageCircle className={currentSize.icon} />
          
          {/* Mobile Text */}
          <span className={`md:hidden font-medium ${currentSize.text}`}>
            Buy via WhatsApp
          </span>
          
          {/* Desktop Text */}
          <div className="hidden md:flex flex-col items-start">
            <span className={`font-medium ${currentSize.text}`}>
              Buy via WhatsApp
            </span>
            {gemstone && (
              <span className="text-xs text-green-100">
                {gemstone.name?.english}
              </span>
            )}
          </div>
        </div>

        {/* Pulse Animation for Attention */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-lg"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0, 0.3, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        />
      </motion.button>

      {/* Mobile Helper Text */}
      {position === 'sticky' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="md:hidden text-center mt-2"
        >
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Tap to chat with our expert on WhatsApp 💎
          </p>
        </motion.div>
      )}
    </div>
  );
};

// Alternative compact floating button
export const FloatingWhatsAppButton = ({ 
  gemstone = null, 
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { generateWhatsAppURL } = useBusinessContext();

  const handleClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      setTimeout(() => setIsExpanded(false), 3000);
    } else {
      const whatsappData = generateWhatsAppURL(gemstone);
      
      // Use the enhanced open method with app preference and fallback
      if (whatsappData && whatsappData.open) {
        whatsappData.open();
      } else {
        // Fallback for older method (if any)
        const url = typeof whatsappData === 'string' ? whatsappData : whatsappData.webUrl;
        window.open(url, '_blank');
      }
    }
  };

  return (
    <motion.div className={`fixed bottom-6 right-6 z-40 ${className}`}>
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
      >
        <MessageCircle className="w-6 h-6" />
        
        {/* Animated Ring */}
        <motion.div
          className="absolute inset-0 border-2 border-green-300 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.8, 0, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Notification Badge */}
        <motion.div
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
          animate={{
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity
          }}
        >
          1
        </motion.div>
      </motion.button>

      {/* Expanded Label */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ 
          width: isExpanded ? 'auto' : 0, 
          opacity: isExpanded ? 1 : 0 
        }}
        className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap"
      >
        Chat with us! 💬
        <div className="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
      </motion.div>
    </motion.div>
  );
};

export default WhatsAppButton; 