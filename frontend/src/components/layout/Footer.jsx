import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Gem, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle,
  Clock
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import UpdateIndicator from '../common/UpdateIndicator';

const Footer = () => {
  const { businessInfo, generateWhatsAppURL } = useBusiness();
  const [currentYear] = useState(new Date().getFullYear());

  // Format business hours for display
  const formatBusinessHours = () => {
    if (!businessInfo?.businessHours) {
      return '';
    }

    const hours = businessInfo.businessHours;
    const workingDays = [];
    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Group consecutive working days with same hours
    let currentGroup = null;
    let groupStart = null;
    
    weekDays.forEach((day, index) => {
      const dayInfo = hours[day];
      if (!dayInfo?.closed && dayInfo?.open && dayInfo?.close) {
        const timeRange = `${formatTime(dayInfo.open)}-${formatTime(dayInfo.close)}`;
        
        if (!currentGroup || currentGroup.hours !== timeRange) {
          if (currentGroup) {
            workingDays.push(formatDayGroup(groupStart, weekDays[index - 1], currentGroup.hours));
          }
          currentGroup = { hours: timeRange };
          groupStart = day;
        }
      } else {
        if (currentGroup) {
          workingDays.push(formatDayGroup(groupStart, weekDays[index - 1], currentGroup.hours));
          currentGroup = null;
        }
      }
    });
    
    // Add the last group if exists
    if (currentGroup) {
      workingDays.push(formatDayGroup(groupStart, weekDays[weekDays.length - 1], currentGroup.hours));
    }
    
    // Add closed days
    const closedDays = weekDays.filter(day => hours[day]?.closed || (!hours[day]?.open && !hours[day]?.close));
    if (closedDays.length > 0) {
      const closedDayNames = closedDays.map(day => day.charAt(0).toUpperCase() + day.slice(1, 3));
      workingDays.push(`${closedDayNames.join(', ')}: Closed`);
    }
    
    return workingDays.join(' | ');
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}${minutes !== '00' ? ':' + minutes : ''}${ampm}`;
  };

  const formatDayGroup = (startDay, endDay, hours) => {
    const dayNames = {
      monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', 
      thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
    };
    
    if (startDay === endDay) {
      return `${dayNames[startDay]}: ${hours}`;
    } else {
      return `${dayNames[startDay]}-${dayNames[endDay]}: ${hours}`;
    }
  };

  // Quick contact info for mobile
  const handleWhatsAppQuickChat = () => {
    if (!businessInfo?.shopName) return;
    const message = `Hello ${businessInfo?.shopName},\n\nI found your website and would like to get quick assistance with gemstone selection. Please help me choose the right gemstone for my needs.\n\nThank you!`;

    const whatsappData = generateWhatsAppURL(null, message);
    if (whatsappData && whatsappData.open) {
      whatsappData.open();
    } else {
      const url = typeof whatsappData === 'string' ? whatsappData : whatsappData?.webUrl;
      if (url) window.open(url, '_blank');
    }
  };

  // Essential links only
  const essentialLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'All Gemstones', href: '/gemstones' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <footer className="bg-sapphire dark:bg-gray-900 text-white">
      {/* Quick WhatsApp Contact - Compact */}
      <div className="bg-green-600 hover:bg-green-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <button
            onClick={handleWhatsAppQuickChat}
            className="w-full flex items-center justify-center space-x-2 text-white font-medium"
            disabled={!businessInfo?.contact?.whatsapp}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Chat with us on WhatsApp - Get instant help! 💎</span>
          </button>
        </div>
      </div>

      {/* Main Footer Content - Ultra Compact */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          
          {/* Company Info - Minimal */}
          <div className="flex-1">
            <Link to="/" className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-r from-golden via-ruby to-emerald rounded-full flex items-center justify-center">
                <Gem className="w-3 h-3 text-white" />
              </div>
              <span className="font-heading text-lg font-bold text-golden">
                {businessInfo?.shopName || ''}
              </span>
            </Link>
            
            <p className="text-gray-300 text-xs mb-2 leading-tight max-w-xs">
              {businessInfo?.tagline || ''}
            </p>

            {/* Essential Links - Horizontal */}
            <div className="flex gap-3 mb-2">
              {essentialLinks.map((link, index) => (
                <Link 
                  key={index}
                  to={link.href}
                  className="text-gray-300 hover:text-golden transition-colors text-xs"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Update Indicator */}
            <UpdateIndicator className="mt-2" />
          </div>

          {/* Contact Info - Compact */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 gap-1">
              {/* Phone & WhatsApp - Same Line */}
              {businessInfo?.contact?.phone && (
                <div className="flex items-center justify-between">
                  <a 
                    href={`tel:${businessInfo.contact.phone}`}
                    className="flex items-center space-x-1 text-gray-300 hover:text-golden transition-colors text-xs"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{businessInfo.contact.phone}</span>
                  </a>
                  
                  {businessInfo?.contact?.whatsapp && (
                    <button
                      onClick={handleWhatsAppQuickChat}
                      className="flex items-center space-x-1 text-gray-300 hover:text-green-400 transition-colors text-xs"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                  )}
                </div>
              )}

              {/* Email */}
              {businessInfo?.contact?.email && (
                <a 
                  href={`mailto:${businessInfo.contact.email}`}
                  className="flex items-center space-x-1 text-gray-300 hover:text-golden transition-colors text-xs"
                >
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{businessInfo.contact.email}</span>
                </a>
              )}

              {/* Address - One Line */}
              {(businessInfo?.address?.city || businessInfo?.address?.state) && (
                <div className="flex items-center space-x-1 text-gray-300 text-xs">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    {[businessInfo?.address?.city, businessInfo?.address?.state].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}

              {/* Hours - One Line */}
              {formatBusinessHours() && (
                <div className="flex items-center space-x-1 text-gray-300 text-xs">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span>{formatBusinessHours()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright - Ultra Compact */}
      <div className="border-t border-gray-700 bg-sapphire/80 dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <p className="text-center text-xs text-gray-400">
            © {currentYear} {businessInfo?.shopName || ''}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 