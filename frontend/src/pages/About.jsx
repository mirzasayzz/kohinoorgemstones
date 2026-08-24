import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gem, 
  Shield, 
  Award, 
  Users, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  BadgeCheck, 
  ExternalLink,
  MessageCircle,
  X,
  ChevronDown
} from 'lucide-react';
import { useBusinessContext } from '../context/BusinessContext';
import SEOHead from '../components/common/SEOHead';
import LoadingSpinner from '../components/common/LoadingSpinner';

const About = () => {
  const { businessInfo, loading, error, forceRefresh } = useBusinessContext();
  const [showCertModal, setShowCertModal] = useState(false);
  const [showHoursDropdown, setShowHoursDropdown] = useState(false);

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

  const getTodayHoursString = () => {
    if (!businessInfo?.businessHours) return '';
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const todayHours = businessInfo.businessHours[currentDay];
    
    if (!todayHours || todayHours.closed) return 'Closed today';
    return `Open today: ${formatTime(todayHours.open)} - ${formatTime(todayHours.close)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !businessInfo) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md p-8 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">Something went wrong</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            We are having trouble loading our company details. Please try again.
          </p>
          <button 
            onClick={() => forceRefresh()} 
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      icon: Clock, 
      label: 'Years of Heritage', 
      value: businessInfo?.heritage?.foundedYear 
        ? new Date().getFullYear() - businessInfo.heritage.foundedYear 
        : '35+' 
    },
    { icon: Gem, label: 'Exquisite Varieties', value: '500+' },
    { icon: Users, label: 'Happy Patrons', value: '10,000+' },
    { icon: Shield, label: 'Authentic & Certified', value: '100%' }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 80, damping: 15 }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 transition-colors duration-300 pb-16">
      <SEOHead 
        title={`Our Story & Contact - ${businessInfo.shopName || 'Kohinoor Gemstones'}`}
        description={`Learn about ${businessInfo.shopName || 'Kohinoor Gemstones'}, our decades-old family heritage, certified store standards, and locate or call our premium showroom.`}
        keywords="about us, contact, business hours, store location, gemstone certificate, Bareilly, Kohinoor Gemstones, authentic gems"
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden py-10 md:py-14 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-850">
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-orange-500/5 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-full uppercase mb-2.5">
              <SparklesIcon className="w-3 h-3" /> Established {businessInfo.heritage?.foundedYear || '1990'}
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">
              Our Story &amp; Contact
            </h1>
            {businessInfo.tagline && (
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-450 max-w-xl mx-auto font-normal leading-relaxed">
                {businessInfo.tagline}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 mt-8 md:mt-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10 md:space-y-16"
        >
          {/* Section 1: Legacy and Stats */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white border-l-4 border-amber-500 pl-3">
                Our Heritage &amp; Promise
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none text-xs sm:text-sm text-neutral-600 dark:text-neutral-355 leading-relaxed space-y-3">
                <p>
                  {businessInfo.description || 'We are a family-owned gemstone business dedicated to providing authentic, certified gemstones with a heritage of trust and excellence.'}
                </p>
                {businessInfo.heritage?.story && (
                  <p className="italic font-light text-neutral-500 dark:text-neutral-400 border-l-2 border-neutral-200 dark:border-neutral-800 pl-3 py-0.5">
                    "{businessInfo.heritage.story}"
                  </p>
                )}
              </div>

              {businessInfo.heritage?.specialties && businessInfo.heritage.specialties.length > 0 && (
                <div className="pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2.5">Our Specialties</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {businessInfo.heritage.specialties.map((specialty, index) => (
                      <div 
                        key={index} 
                        className="flex items-center space-x-2.5 p-2.5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/50 dark:border-neutral-800/80 shadow-sm transition-all hover:border-amber-500/20"
                      >
                        <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{specialty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3 md:gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div 
                    key={index} 
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="p-4 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm hover:shadow hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <Icon className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                    <div className="text-xl md:text-2xl font-bold text-neutral-950 dark:text-white tracking-tight mb-0.5">
                      {stat.value}
                    </div>
                    <div className="text-[10px] md:text-[11px] font-semibold text-neutral-450 dark:text-neutral-400 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Section 2: Store Certification */}
          {businessInfo.storeCertification?.enabled && (
            <motion.section variants={itemVariants} className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl blur-xl opacity-50 dark:opacity-20 pointer-events-none"></div>
              <div className="bg-gradient-to-br from-white to-emerald-50/10 dark:from-neutral-900 dark:to-emerald-950/5 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-md">
                <div className="p-5 md:p-7">
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center">
                    
                    {/* Certification Image with custom Magnify Zoom effect */}
                    {businessInfo.storeCertification.certificationImage && (
                      <div className="w-full max-w-xs lg:w-1/4 flex-shrink-0">
                        <div 
                          onClick={() => setShowCertModal(true)}
                          className="relative group cursor-zoom-in rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-850 shadow transition-all duration-500 hover:shadow-lg hover:border-emerald-500/30"
                        >
                          <img 
                            src={businessInfo.storeCertification.certificationImage} 
                            alt={`${businessInfo.storeCertification.labName} Certificate`}
                            className="w-full h-auto object-cover transform duration-700 group-hover:scale-103"
                          />
                          <div className="absolute inset-0 bg-neutral-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="px-3 py-1.5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur text-xs font-semibold rounded-lg text-neutral-900 dark:text-white flex items-center gap-1 shadow-md">
                              <SearchIcon className="w-3.5 h-3.5" /> Zoom Certificate
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Certification Details */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-950/30 rounded-xl text-emerald-600 dark:text-emerald-455">
                          <BadgeCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-widest block">Official Store Certification</span>
                          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                            {businessInfo.storeCertification.labName || 'JG Gems Testing Lab'}
                          </h3>
                          {businessInfo.storeCertification.tagline && (
                            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70 mt-0.5">
                              {businessInfo.storeCertification.tagline}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {businessInfo.storeCertification.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
                          {businessInfo.storeCertification.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4 border-b border-neutral-150 dark:border-neutral-800 text-xs">
                        {businessInfo.storeCertification.labAddress && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-455 mt-0.5 flex-shrink-0" />
                            <span className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
                              {businessInfo.storeCertification.labAddress}
                            </span>
                          </div>
                        )}
                        
                        {businessInfo.storeCertification.labWebsite && (
                          <div className="flex items-center">
                            <a 
                              href={businessInfo.storeCertification.labWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-450 hover:text-emerald-700 dark:hover:text-emerald-350 font-semibold group"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Verify lab details
                              <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                          <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-455" />
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-350">
                          100% Guaranteed Authenticity for Every Purchase
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}          {/* Section 3: Contact Details & Map Grid */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            
            {/* Contact Drawer & Hours Card */}
            <div className="lg:col-span-6 space-y-3">
              <div>
                <h2 className="text-base md:text-lg font-bold text-neutral-900 dark:text-white border-l-4 border-amber-500 pl-2.5 mb-0.5">
                  Get in Touch
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 font-light text-[11px] pl-3.5">
                  Have questions about astrology, certifications, or custom cuts? Contact us directly.
                </p>
              </div>

              {/* Glowing Live Store Hours Status */}
              <div className="p-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen() ? 'bg-emerald-400' : 'bg-rose-450'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen() ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                      {isOpen() ? 'Open Now' : 'Closed Right Now'}
                    </h4>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      {getTodayHoursString()}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowHoursDropdown(!showHoursDropdown)}
                  className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline hover:opacity-90"
                >
                  Weekly Schedule
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showHoursDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Dynamic Weekly Schedule Grid */}
              <AnimatePresence>
                {showHoursDropdown && businessInfo.businessHours && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-855 rounded-xl p-2.5 shadow-inner space-y-1 text-[11px]"
                  >
                    {Object.entries(businessInfo.businessHours).map(([day, hours]) => {
                      const isToday = new Date().getDay() === ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day);
                      return (
                        <div key={day} className={`flex justify-between py-0.5 px-1 rounded ${isToday ? 'bg-amber-50 dark:bg-amber-950/20 font-semibold' : ''}`}>
                          <span className="capitalize text-neutral-700 dark:text-neutral-300">
                            {day} {isToday && <span className="text-[8px] bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded ml-1">Today</span>}
                          </span>
                          <span className="text-neutral-550 dark:text-neutral-405">
                            {hours.closed ? 'Closed' : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
                          </span>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons Panel */}
              <div className="grid grid-cols-3 gap-2">
                {businessInfo.contact?.whatsapp && (
                  <a
                    href={`https://wa.me/${businessInfo.contact.whatsapp.replace(/[^\d]/g, '')}?text=${encodeURIComponent("Hi! I'd like to inquire about your gemstones.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 rounded-lg text-[11px] transition-all duration-300 scale-100 hover:scale-[1.01] active:scale-[0.99] shadow-sm shadow-emerald-500/10"
                  >
                    <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>WhatsApp</span>
                  </a>
                )}
                
                {businessInfo.contact?.phone && (
                  <a
                    href={`tel:${businessInfo.contact.phone}`}
                    className="flex items-center justify-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-1.5 rounded-lg text-[11px] transition-all duration-300 scale-100 hover:scale-[1.01] active:scale-[0.99] shadow-sm shadow-amber-500/10"
                  >
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Call Now</span>
                  </a>
                )}

                {businessInfo.contact?.email && (
                  <a
                    href={`mailto:${businessInfo.contact.email}`}
                    className="flex items-center justify-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold py-1.5 rounded-lg text-[11px] hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all duration-300 scale-100 hover:scale-[1.01]"
                  >
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Email Us</span>
                  </a>
                )}
              </div>

              {/* Detail Cards */}
              <div className="space-y-2 pt-1">
                {businessInfo.contact?.phone && (
                  <div className="flex items-center gap-2.5 p-2 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-850 rounded-xl shadow-sm transition-all hover:border-amber-500/10">
                    <div className="p-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-lg">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-neutral-450 dark:text-neutral-400 uppercase tracking-wide">Direct Phone</div>
                      <a href={`tel:${businessInfo.contact.phone}`} className="text-[11px] font-bold text-neutral-900 dark:text-white hover:text-amber-500 transition-colors">
                        {businessInfo.contact.phone}
                      </a>
                    </div>
                  </div>
                )}

                {businessInfo.contact?.email && (
                  <div className="flex items-center gap-2.5 p-2 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-850 rounded-xl shadow-sm transition-all hover:border-amber-500/10">
                    <div className="p-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-lg">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-neutral-455 dark:text-neutral-400 uppercase tracking-wide">Email Address</div>
                      <a href={`mailto:${businessInfo.contact.email}`} className="text-[11px] font-bold text-neutral-900 dark:text-white hover:text-amber-500 transition-colors">
                        {businessInfo.contact.email}
                      </a>
                    </div>
                  </div>
                )}

                {businessInfo.address?.fullAddress && (
                  <div className="flex items-start gap-2.5 p-2 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-855 rounded-xl shadow-sm transition-all hover:border-amber-500/10">
                    <div className="p-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-lg mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[9px] font-bold text-neutral-450 dark:text-neutral-400 uppercase tracking-wide">Store Address</div>
                      <div className="text-[11px] font-bold text-neutral-900 dark:text-white leading-tight">
                        {businessInfo.address.fullAddress}
                      </div>
                      {businessInfo.googleMapsUrl && (
                        <a 
                          href={businessInfo.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[9px] text-amber-600 dark:text-amber-400 font-bold hover:underline mt-0.5"
                        >
                          <ExternalLink className="w-2.5 h-2.5" /> Get Directions
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map Container */}
            <div className="lg:col-span-6 flex flex-col">
              <h2 className="text-base md:text-lg font-bold text-neutral-900 dark:text-white border-l-4 border-amber-500 pl-2.5 mb-0.5">
                Visit Our Showroom
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 font-light text-[11px] pl-3.5 mb-3">
                Step inside to browse our loose gems catalog, certified crystals, and get customized advice.
              </p>
              
              <div className="flex-1 min-h-[200px] md:min-h-[250px] bg-neutral-200 dark:bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-md relative group transition-all duration-500 hover:shadow-lg hover:border-amber-500/20">
                {businessInfo.googleMapsUrl ? (
                  <iframe
                    src={(() => {
                      const url = businessInfo.googleMapsUrl;
                      if (url.includes('embed') || url.includes('output=embed')) {
                        return url;
                      }
                      if (url.includes('maps.app.goo.gl') || url.includes('goo.gl')) {
                        const address = businessInfo.address 
                          ? `${businessInfo.address.street || ''}, ${businessInfo.address.city || ''}, ${businessInfo.address.state || ''}, ${businessInfo.address.pincode || ''}`
                          : 'Shahbad, Bareilly, Uttar Pradesh, India';
                        return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
                      }
                      const coordMatch = url.match(/[?&]q=([0-9.-]+),([0-9.-]+)/);
                      if (coordMatch) {
                        return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=15&output=embed`;
                      }
                      const placeMatch = url.match(/place\/([^\/]+)/);
                      if (placeMatch) {
                        return `https://maps.google.com/maps?q=${encodeURIComponent(placeMatch[1].replace(/\+/g, ' '))}&z=15&output=embed`;
                      }
                      return url.includes('?') ? `${url}&output=embed` : `${url}?output=embed`;
                    })()}
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
                  <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                    <div className="text-center">
                      <MapPin className="w-10 h-10 text-neutral-400 mx-auto mb-2 animate-bounce" />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Loading map coordinates...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        </motion.div>
      </div>

      {/* Fullscreen Lightbox Modal for Store Certification Image */}
      <AnimatePresence>
        {showCertModal && businessInfo.storeCertification?.certificationImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-md"
            onClick={() => setShowCertModal(false)}
          >
            <motion.button 
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              onClick={() => setShowCertModal(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative max-w-4xl max-h-[90vh] overflow-auto rounded-2xl bg-white dark:bg-neutral-900 p-2 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={businessInfo.storeCertification.certificationImage} 
                alt={`${businessInfo.storeCertification.labName} Certification Document`}
                className="max-w-full h-auto max-h-[85vh] rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Internal icons & items helper
const SparklesIcon = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z"/>
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/>
  </svg>
);

const SearchIcon = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export default About;