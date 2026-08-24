import { Link } from 'react-router-dom';
import { 
  Gem
} from 'lucide-react';
import { useBusinessContext } from '../../context/BusinessContext';

const Footer = () => {
  const { businessInfo } = useBusinessContext();

  return (
    <footer className="bg-luxury-charcoal dark:bg-luxury-charcoal text-luxury-pearl">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-2 md:py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <Link to="/" className="flex items-center justify-center md:justify-start space-x-2 mb-1 md:mb-2 group">
              <Gem className="w-4 h-4 md:w-5 md:h-5 text-luxury-gold group-hover:animate-pulse" />
              <span className="font-luxury text-sm md:text-base font-bold text-luxury-pearl">
                {businessInfo?.shopName || 'Kohinoor'}
              </span>
            </Link>
            <p className="text-luxury-pearl/70 text-xs leading-relaxed mb-1 md:mb-2">
              {businessInfo?.description || 'Premium natural gemstones with three generations of expertise. Each piece certified authentic and ethically sourced.'}
            </p>
            <div className="text-xs text-luxury-pearl/60">
              <p>© {new Date().getFullYear()} • Est. 1985 • Family Owned • Certified Authentic</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <h3 className="font-medium text-luxury-pearl mb-1 text-xs md:text-sm">
              Contact Us
            </h3>
            <div className="space-y-1">
              {/* Contact Info Line */}
              <div className="text-xs md:text-sm text-luxury-pearl/70">
                {businessInfo?.contact?.phone && (
                  <a 
                    href={`tel:${businessInfo.contact.phone}`}
                    className="hover:text-luxury-gold transition-colors duration-200"
                  >
                    {businessInfo.contact.phone}
                  </a>
                )}
                {businessInfo?.contact?.phone && businessInfo?.contact?.email && (
                  <span className="mx-2">•</span>
                )}
                {businessInfo?.contact?.email && (
                  <a 
                    href={`mailto:${businessInfo.contact.email}`}
                    className="hover:text-luxury-gold transition-colors duration-200"
                  >
                    {businessInfo.contact.email}
                  </a>
                )}
              </div>
              
              {/* Business Hours Line */}
              {(businessInfo?.contact?.hours || businessInfo?.businessHours) && (
                <div className="text-xs md:text-sm text-luxury-pearl/70">
                  {businessInfo?.contact?.hours ? (
                    businessInfo.contact.hours
                  ) : businessInfo?.businessHours ? (
                    <>
                      {!businessInfo.businessHours.monday?.closed && businessInfo.businessHours.monday?.open ? (
                        `Mon-Fri: ${businessInfo.businessHours.monday.open} - ${businessInfo.businessHours.monday.close}`
                      ) : (
                        'Mon-Fri: 10:00 AM - 8:00 PM'
                      )}
                      <span className="mx-2">•</span>
                      {!businessInfo.businessHours.saturday?.closed && businessInfo.businessHours.saturday?.open ? (
                        `Sat: ${businessInfo.businessHours.saturday.open} - ${businessInfo.businessHours.saturday.close}`
                      ) : (
                        'Sat: 10:00 AM - 8:00 PM'
                      )}
                      <span className="mx-2">•</span>
                      {businessInfo.businessHours.sunday?.closed ? (
                        'Sun: Closed'
                      ) : businessInfo.businessHours.sunday?.open ? (
                        `Sun: ${businessInfo.businessHours.sunday.open} - ${businessInfo.businessHours.sunday.close}`
                      ) : (
                        'Sun: Closed'
                      )}
                    </>
                  ) : (
                    'Mon-Sat: 10:00 AM - 8:00 PM'
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 