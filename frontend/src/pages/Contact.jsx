import { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { useBusinessContext } from '../context/BusinessContext';
import SEOHead from '../components/common/SEOHead';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Contact = () => {
  const { businessInfo, loading, error, forceRefresh } = useBusinessContext();

  // Check if business is currently open
  const isOpen = () => {
    if (!businessInfo?.businessHours) return false;
    
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    const todayHours = businessInfo.businessHours[currentDay];
    if (!todayHours || todayHours.closed) return false;
    
    if (!todayHours.open || !todayHours.close) return false;
    
    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
    const openTimeMinutes = openHour * 60 + openMin;
    const closeTimeMinutes = closeHour * 60 + closeMin;
    
    return currentTimeMinutes >= openTimeMinutes && currentTimeMinutes <= closeTimeMinutes;
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hour, minute] = time.split(':');
    const hour12 = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${hour12}:${minute} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !businessInfo) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">Contact Us</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">We're updating our contact information. Please try again shortly.</p>
          <button onClick={() => forceRefresh()} className="px-6 py-2 bg-luxury-gold text-luxury-charcoal rounded-lg hover:bg-luxury-gold/90 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Contact Us"
        description="Get in touch with our gemstone experts. Visit our store, call, or send us a message."
        keywords="contact, gemstone consultation, phone, store location, business hours"
      />
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        
        {/* Header */}
        <section className="bg-luxury-pearl dark:bg-luxury-charcoal py-8 md:py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-luxury-charcoal dark:text-luxury-pearl mb-3">
              Contact Us
            </h1>
            <p className="text-sm md:text-base text-luxury-charcoal/70 dark:text-luxury-pearl/70">
              Visit our store, give us a call, or send us a message
            </p>
            
            {/* Open/Closed Status */}
            <div className="mt-4 inline-flex items-center space-x-2 px-3 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full">
              <div className={`w-2 h-2 rounded-full ${isOpen() ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs font-medium text-luxury-charcoal dark:text-luxury-pearl">
                {isOpen() ? 'Open Now' : 'Currently Closed'}
              </span>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 md:py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

              {/* Contact Information */}
              <div className="space-y-6">
                
                {/* Quick Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {businessInfo?.contact?.whatsapp && (
                    <a
                      href={`https://wa.me/${businessInfo.contact.whatsapp.replace(/[^\d]/g, '')}?text=${encodeURIComponent("Hi! I'd like to inquire about your gemstones.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  
                  {businessInfo?.contact?.phone && (
                    <a
                      href={`tel:${businessInfo.contact.phone}`}
                      className="flex items-center justify-center space-x-2 bg-luxury-gold hover:bg-luxury-gold/90 text-luxury-charcoal px-4 py-3 rounded-lg transition-colors text-sm"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Now</span>
                    </a>
                  )}
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                  {businessInfo?.contact?.phone && (
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Phone className="w-5 h-5 text-luxury-gold" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Phone</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{businessInfo.contact.phone}</div>
                      </div>
                    </div>
                  )}

                  {businessInfo?.contact?.email && (
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Mail className="w-5 h-5 text-luxury-gold" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Email</div>
                        <a 
                          href={`mailto:${businessInfo.contact.email}`}
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-luxury-gold"
                        >
                          {businessInfo.contact.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {businessInfo?.address?.fullAddress && (
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <MapPin className="w-5 h-5 text-luxury-gold mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white mb-1">Address</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {businessInfo.address.fullAddress}
                        </div>
                        {businessInfo.googleMapsUrl && (
                          <a 
                            href={businessInfo.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-luxury-gold hover:text-luxury-gold/80 text-sm"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View on Maps
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Business Hours */}
                  {businessInfo?.businessHours && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Clock className="w-5 h-5 text-luxury-gold" />
                        <div className="font-medium text-gray-900 dark:text-white">Business Hours</div>
                        <div className={`w-2 h-2 rounded-full ${isOpen() ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      </div>
                      
                      <div className="space-y-1">
                        {Object.entries(businessInfo.businessHours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between text-sm">
                            <span className="capitalize text-gray-700 dark:text-gray-300">{day}:</span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {hours.closed ? 'Closed' : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Map */}
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-luxury-charcoal dark:text-luxury-pearl mb-4">
                  Visit Our Store
                </h2>
                
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden h-64 md:h-96">
                  {businessInfo?.googleMapsUrl ? (
                    <iframe
                      src={businessInfo.googleMapsUrl.includes('embed') 
                        ? businessInfo.googleMapsUrl 
                        : `https://www.google.com/maps/embed?pb=${businessInfo.googleMapsUrl}`
                      }
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full"
                      title="Store Location"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">Map Loading...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Contact; 