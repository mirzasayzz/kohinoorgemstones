import { Link } from 'react-router-dom';

/**
 * Minimalist Kohinoor Logo Component
 * Uses the original kohinoor-logo.png with clean styling
 */
const Logo = ({ size = 'default', showText = true, className = '', onClick }) => {
  const sizes = {
    small: { icon: 'w-8 h-8', text: 'text-lg', tagline: 'text-[8px]' },
    default: { icon: 'w-10 h-10', text: 'text-xl', tagline: 'text-[10px]' },
    large: { icon: 'w-12 h-12', text: 'text-2xl', tagline: 'text-xs' }
  };

  const currentSize = sizes[size] || sizes.default;

  return (
    <Link 
      to="/" 
      className={`flex items-center gap-2.5 group ${className}`}
      onClick={onClick}
    >
      {/* Original Logo Image */}
      <img 
        src="/kohinoor-logo.png" 
        alt="Kohinoor" 
        className={`${currentSize.icon} object-contain transition-transform duration-300 group-hover:scale-105`}
      />

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <span 
            className={`${currentSize.text} font-serif font-bold tracking-tight bg-gradient-to-r from-luxury-gold via-yellow-400 to-luxury-gold bg-clip-text text-transparent group-hover:from-yellow-400 group-hover:to-luxury-gold transition-all duration-300 leading-none drop-shadow-sm`}
          >
            Kohinoor Gemstone
          </span>
          <span 
            className={`${currentSize.tagline} font-medium tracking-wide text-neutral-600 dark:text-neutral-400 mt-0.5`}
          >
            Symbol of royalty, purity & power
          </span>
        </div>
      )}
    </Link>
  );
};

export default Logo;
