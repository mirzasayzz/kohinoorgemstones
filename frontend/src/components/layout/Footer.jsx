import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Gem, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useBusinessContext } from '../../context/BusinessContext';

const Footer = () => {
  const { businessInfo, generateWhatsAppURL } = useBusinessContext();
  const [currentYear] = useState(new Date().getFullYear());

  // Check if business is currently open
  const isCurrentlyOpen = () => {
    if (!businessInfo?.businessHours) return null;
    
    const now = new Date();
    const currentDay = now.toLocaleLowerCase().substring(0, 3); // 'mon', 'tue', etc.
    const currentTime = now.getHours() * 100 + now.getMinutes(); // Convert to HHMM format
    
    const dayMap = {
      'sun': 'sunday',
      'mon': 'monday', 
      'tue': 'tuesday',
      'wed': 'wednesday',
      'thu': 'thursday',
      'fri': 'friday',
      'sat': 'saturday'
    };
    
    const fullDayName = dayMap[currentDay];
    const todayHours = businessInfo.businessHours[fullDayName];
    
    if (!todayHours || todayHours.closed) return false;
    
    if (todayHours.open && todayHours.close) {
      const openTime = parseInt(todayHours.open.replace(':', ''));
      const closeTime = parseInt(todayHours.close.replace(':', ''));
      return currentTime >= openTime && currentTime <= closeTime;
    }
    
    return false;
  };

  // Format time for display
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}${minutes !== '00' ? ':' + minutes : ''}${ampm}`;
  };

  // Get today's hours
  const getTodayHours = () => {
    if (!businessInfo?.businessHours) return '';
    
    const now = new Date();
    const currentDay = now.toLocaleLowerCase().substring(0, 3);
    
    const dayMap = {
      'sun': 'sunday',
      'mon': 'monday', 
      'tue': 'tuesday',
      'wed': 'wednesday',
      'thu': 'thursday',
      'fri': 'friday',
      'sat': 'saturday'
    };
    
    const fullDayName = dayMap[currentDay];
    const todayHours = businessInfo.businessHours[fullDayName];
    
    if (!todayHours || todayHours.closed) return 'Closed today';
    
    if (todayHours.open && todayHours.close) {
      return `${formatTime(todayHours.open)} - ${formatTime(todayHours.close)}`;
    }
    
    return '';
  };

  // Handle WhatsApp click
  const handleWhatsAppClick = () => {
    if (!businessInfo?.contact?.whatsapp) return;
    
    const message = `Hello! I found your website and would like to inquire about your gemstones. Could you please help me?`;
    const whatsappData = generateWhatsAppURL(null, message);
    
    if (whatsappData && whatsappData.open) {
      whatsappData.open();
    }
  };

  const currentlyOpen = isCurrentlyOpen();
  const todayHours = getTodayHours();

  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Business Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 via-red-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Gem className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-amber-400">
                {businessInfo?.shopName || 'Gemstone Store'}
              </span>
            </Link>
            
            {businessInfo?.tagline && (
              <p className="text-gray-400 text-sm leading-relaxed">
                {businessInfo.tagline}
              </p>
            )}

            {/* Quick Links */}
            <div className="flex flex-wrap gap-4 text-sm">
              <Link to="/about" className="text-gray-400 hover:text-amber-400 transition-colors">
                About
              </Link>
              <Link to="/gemstones" className="text-gray-400 hover:text-amber-400 transition-colors">
                Gemstones
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-amber-400 transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-400">Contact Us</h3>
            
            <div className="space-y-3">
              {businessInfo?.contact?.phone && (
                <a 
                  href={`tel:${businessInfo.contact.phone}`}
                  className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group"
                >
                  <Phone className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                  <span>{businessInfo.contact.phone}</span>
                </a>
              )}

              {businessInfo?.contact?.whatsapp && (
                <button
                  onClick={handleWhatsAppClick}
                  className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group w-full text-left"
                >
                  <MessageCircle className="w-4 h-4 text-green-400 group-hover:text-green-300" />
                  <span>WhatsApp: {businessInfo.contact.whatsapp}</span>
                </button>
              )}

              {businessInfo?.contact?.email && (
                <a 
                  href={`mailto:${businessInfo.contact.email}`}
                  className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group"
                >
                  <Mail className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                  <span className="break-all">{businessInfo.contact.email}</span>
                </a>
              )}

              {(businessInfo?.address?.street || businessInfo?.address?.city) && (
                <div className="flex items-start space-x-3 text-gray-300">
                  <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm leading-relaxed">
                    {businessInfo.address.street && (
                      <div>{businessInfo.address.street}</div>
                    )}
                    <div>
                      {[
                        businessInfo.address.area,
                        businessInfo.address.city,
                        businessInfo.address.state,
                        businessInfo.address.pincode
                      ].filter(Boolean).join(', ')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Business Hours & Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-400">Store Hours</h3>
            
            {/* Current Status */}
            <div className="flex items-center space-x-2 p-3 rounded-lg bg-gray-800">
              {currentlyOpen === true ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-green-400 font-medium">Open Now</div>
                    <div className="text-gray-400 text-sm">{todayHours}</div>
                  </div>
                </>
              ) : currentlyOpen === false ? (
                <>
                  <XCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <div className="text-red-400 font-medium">Closed</div>
                    <div className="text-gray-400 text-sm">{todayHours}</div>
                  </div>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-gray-400 font-medium">Hours Not Set</div>
                    <div className="text-gray-500 text-sm">Contact us for availability</div>
                  </div>
                </>
              )}
            </div>

            {/* All Week Hours - Simplified */}
            {businessInfo?.businessHours && (
              <div className="space-y-1 text-sm">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                  const dayInfo = businessInfo.businessHours[day];
                  const dayName = day.charAt(0).toUpperCase() + day.slice(1, 3);
                  
                  return (
                    <div key={day} className="flex justify-between items-center text-gray-400">
                      <span>{dayName}</span>
                      <span>
                        {dayInfo?.closed || (!dayInfo?.open && !dayInfo?.close) 
                          ? 'Closed' 
                          : dayInfo?.open && dayInfo?.close 
                            ? `${formatTime(dayInfo.open)} - ${formatTime(dayInfo.close)}`
                            : 'N/A'
                        }
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="text-center text-gray-500 text-sm">
            © {currentYear} {businessInfo?.shopName || 'Gemstone Store'}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 