import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  ExternalLink,
  Globe,
  Calendar,
  Star,
  ArrowRight
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import SEOHead from '../components/common/SEOHead';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Contact = () => {
  const { businessInfo, loading } = useBusiness();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  // Get next opening time
  const getNextOpeningTime = () => {
    if (!businessInfo?.businessHours) return null;
    
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() + i);
      const dayName = days[checkDate.getDay()];
      const dayHours = businessInfo.businessHours[dayName];
      
      if (dayHours && !dayHours.closed && dayHours.open) {
        if (i === 0 && !isOpen()) {
          // Today but after closing time
          const [openHour, openMin] = dayHours.open.split(':').map(Number);
          const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
          const openTimeMinutes = openHour * 60 + openMin;
          
          if (currentTimeMinutes < openTimeMinutes) {
            return { day: 'Today', time: dayHours.open };
          }
        } else if (i > 0) {
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          return { day: dayNames[checkDate.getDay()], time: dayHours.open };
        }
      }
    }
    return null;
  };

  const handleWhatsAppClick = () => {
    if (businessInfo?.contact?.whatsapp) {
      const message = encodeURIComponent("Hi! I'd like to inquire about your gemstones and services.");
      window.open(`https://wa.me/${businessInfo.contact.whatsapp.replace(/[^\d]/g, '')}?text=${message}`, '_blank');
    }
  };

  const handleCallClick = () => {
    if (businessInfo?.contact?.phone) {
      window.open(`tel:${businessInfo.contact.phone}`, '_self');
    }
  };

  const handleEmailClick = () => {
    if (businessInfo?.contact?.email) {
      window.open(`mailto:${businessInfo.contact.email}`, '_self');
    }
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const nextOpening = getNextOpeningTime();

  return (
    <>
      <SEOHead 
        title="Contact Us - Get in Touch"
        description="Contact Kohinoor Gemstone for expert consultation. Reach us via WhatsApp, phone, email or visit our store. Check our business hours and location."
        keywords="contact, gemstone consultation, WhatsApp, phone, store location, business hours"
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-sapphire via-emerald to-golden overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6"
              >
                <MessageCircle className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Get Expert Consultation</span>
              </motion.div>
              
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                Let's Connect
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                Ready to find your perfect gemstone? Our experts are here to guide you through 
                your journey to authentic, premium gemstones.
              </p>
              
              {/* Quick Status */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3"
              >
                <div className={`w-3 h-3 rounded-full ${isOpen() ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                <span className="text-white font-medium">
                  {isOpen() ? 'We\'re Open Now!' : nextOpening ? `Opens ${nextOpening.day} at ${formatTime(nextOpening.time)}` : 'Currently Closed'}
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Get in Touch
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    Whether you're looking for a specific gemstone, need astrological guidance, 
                    or want to learn more about our collection, we're here to help.
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWhatsAppClick}
                    className="flex items-center space-x-3 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">WhatsApp</div>
                      <div className="text-sm opacity-90">Instant Response</div>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCallClick}
                    className="flex items-center space-x-3 bg-sapphire hover:bg-sapphire-dark text-white px-6 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Phone className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">Call Now</div>
                      <div className="text-sm opacity-90">Direct Line</div>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </motion.button>
                </div>

                {/* Contact Details */}
                <div className="space-y-6">
                  {businessInfo?.contact?.phone && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="p-3 bg-sapphire/10 rounded-lg">
                        <Phone className="w-6 h-6 text-sapphire" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Phone</h3>
                        <p className="text-gray-600 dark:text-gray-300 font-medium">{businessInfo.contact.phone}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Available during business hours</p>
                      </div>
                    </motion.div>
                  )}

                  {businessInfo?.contact?.email && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="p-3 bg-emerald/10 rounded-lg">
                        <Mail className="w-6 h-6 text-emerald" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h3>
                        <button 
                          onClick={handleEmailClick}
                          className="text-gray-600 dark:text-gray-300 font-medium hover:text-emerald transition-colors"
                        >
                          {businessInfo.contact.email}
                        </button>
                        <p className="text-sm text-gray-500 dark:text-gray-400">We'll respond within 24 hours</p>
                      </div>
                    </motion.div>
                  )}

                  {businessInfo?.address?.fullAddress && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="p-3 bg-golden/10 rounded-lg">
                        <MapPin className="w-6 h-6 text-golden" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Visit Our Store</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">{businessInfo.address.fullAddress}</p>
                        {businessInfo.googleMapsUrl && (
                          <a
                            href={businessInfo.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-golden hover:text-golden-dark transition-colors text-sm font-medium"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View on Google Maps
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Business Hours */}
                  {businessInfo?.businessHours && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      viewport={{ once: true }}
                      className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-3 bg-ruby/10 rounded-lg">
                          <Clock className="w-6 h-6 text-ruby" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Business Hours</h3>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isOpen() ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            <span className={`text-sm font-medium ${isOpen() ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {isOpen() ? 'Open Now' : 'Currently Closed'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(businessInfo.businessHours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between items-center py-2">
                            <span className="capitalize font-medium text-gray-700 dark:text-gray-300">
                              {day}:
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {hours.closed ? 'Closed' : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Map Section */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Find Us
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Visit our showroom to experience our premium gemstone collection in person.
                  </p>
                </div>

                <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden shadow-xl h-96 lg:h-[500px]">
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
                      title="Kohinoor Gemstone Location"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">Map Loading...</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">Please check back later</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-6 bg-gradient-to-br from-sapphire/10 to-emerald/10 rounded-xl">
                    <Star className="w-8 h-8 text-golden mb-3" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Expert Consultation</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Get personalized gemstone recommendations from our certified experts.
                    </p>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-emerald/10 to-golden/10 rounded-xl">
                    <Calendar className="w-8 h-8 text-emerald mb-3" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Flexible Appointments</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Schedule a convenient time for detailed consultation and viewing.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-sapphire via-emerald to-golden">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Start Your Gemstone Journey?
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Connect with us today and discover the perfect gemstone for your needs.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWhatsAppClick}
                className="inline-flex items-center space-x-3 bg-white text-sapphire px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <MessageCircle className="w-6 h-6" />
                <span>Chat with Expert</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Contact; 