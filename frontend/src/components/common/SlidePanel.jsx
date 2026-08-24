import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const SlidePanel = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  position = 'right', // 'right' or 'bottom'
  showHeader = true,
  fullHeight = true 
}) => {
  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const panelVariants = {
    right: {
      hidden: { x: '100%', opacity: 1 },
      visible: { x: 0, opacity: 1 },
      exit: { x: '100%', opacity: 1 }
    },
    bottom: {
      hidden: { y: '100%', opacity: 1 },
      visible: { y: 0, opacity: 1 },
      exit: { y: '100%', opacity: 1 }
    }
  };

  const panelStyles = {
    right: `fixed top-0 right-0 h-full w-full sm:w-96 max-w-full flex flex-col`,
    bottom: `fixed bottom-0 left-0 right-0 max-h-[90vh] rounded-t-3xl`
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Panel */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants[position]}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`${panelStyles[position]} bg-white dark:bg-neutral-900 z-50 flex flex-col shadow-2xl`}
          >
            {/* Header */}
            {showHeader && (
              <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
            )}
            
            {/* Content */}
            <div className={`flex-1 overflow-hidden ${fullHeight ? '' : 'max-h-[70vh]'}`}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SlidePanel;
