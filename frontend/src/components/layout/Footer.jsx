import { useBusinessContext } from '../../context/BusinessContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Award,
  Sparkles
} from 'lucide-react';
import Logo from '../common/Logo';

const Footer = () => {
  const { businessInfo } = useBusinessContext();

  const currentYear = new Date().getFullYear();
  const foundedYear = businessInfo?.heritage?.foundedYear || 1990;

  return (
    <footer className="bg-neutral-950 text-neutral-450 border-t border-neutral-900 pt-5 pb-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Main Footer Directory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start pb-4 border-b border-neutral-900/60">
          
          {/* Column 1: Brand & Logo */}
          <div className="space-y-1">
            <div className="flex items-center justify-start">
              <Logo size="small" />
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">
              Premium Certified Natural Gemstones
            </p>
          </div>

          {/* Column 2: Contact & Showroom */}
          <div className="space-y-1.5 text-[11px]">
            <h4 className="text-[9px] font-bold text-neutral-200 uppercase tracking-widest mb-1">
              Bareilly Showroom
            </h4>
            
            <div className="space-y-1 text-neutral-400">
              {businessInfo?.address?.fullAddress && (
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>{businessInfo.address.fullAddress}</span>
                </div>
              )}
              
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {businessInfo?.contact?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <a href={`tel:${businessInfo.contact.phone}`} className="hover:text-amber-500 transition-colors">
                      {businessInfo.contact.phone}
                    </a>
                  </div>
                )}

                {businessInfo?.contact?.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <a href={`mailto:${businessInfo.contact.email}`} className="hover:text-amber-500 transition-colors truncate">
                      {businessInfo.contact.email}
                    </a>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-neutral-500 font-medium pt-0.5">
                Hours: Mon-Sat: 10 AM - 8 PM | Sun: Closed
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright details bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 mt-0.5 text-[10px] text-neutral-500 font-semibold">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1">
            <span>© {currentYear} Kohinoor Gemstone.</span>
            <span>Est. {foundedYear}</span>
            <span>•</span>
            <span className="flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5 text-amber-500" /> Family Owned</span>
            <span>•</span>
            <span className="flex items-center gap-0.5"><Award className="w-2.5 h-2.5 text-amber-500" /> Govt Certified</span>
          </div>
          <div className="text-neutral-600 text-[9px]">
            Designed for Authenticity &amp; Power
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;