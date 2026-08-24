import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Gem, 
  Shield, 
  Award,
  Users,
  Clock,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useBusinessContext } from '../context/BusinessContext';
import SEOHead, { seoConfigs } from '../components/common/SEOHead';

const About = () => {
  const { businessInfo } = useBusinessContext();

  const stats = [
    { 
      icon: Clock, 
      label: 'Years in Business', 
      value: businessInfo?.heritage?.foundedYear 
        ? new Date().getFullYear() - businessInfo.heritage.foundedYear 
        : '35+' 
    },
    { icon: Gem, label: 'Gemstone Varieties', value: '500+' },
    { icon: Users, label: 'Happy Customers', value: '1000+' },
    { icon: Shield, label: 'Certified Authentic', value: '100%' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead {...seoConfigs.about} />
      
      {/* Header */}
      <section className="bg-luxury-pearl dark:bg-luxury-charcoal py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-luxury-charcoal dark:text-luxury-pearl mb-3">
            About {businessInfo?.shopName || 'Kohinoor Gemstones'}
          </h1>
          {businessInfo?.tagline && (
            <p className="text-sm md:text-base text-luxury-charcoal/70 dark:text-luxury-pearl/70">
              {businessInfo.tagline}
            </p>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Company Overview */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-semibold text-luxury-charcoal dark:text-luxury-pearl mb-4">
              Our Company
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {businessInfo?.description || 'We are a family-owned gemstone business dedicated to providing authentic, certified gemstones with a heritage of trust and excellence.'}
              </p>
              
              {businessInfo?.heritage?.story && (
                <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  {businessInfo.heritage.story}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <Icon className="w-6 h-6 md:w-8 md:h-8 text-luxury-gold mx-auto mb-2" />
                  <div className="text-lg md:text-xl font-bold text-luxury-charcoal dark:text-luxury-pearl">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Specialties */}
          {businessInfo?.heritage?.specialties && businessInfo.heritage.specialties.length > 0 && (
            <div className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-luxury-charcoal dark:text-luxury-pearl mb-4">
                Our Specialties
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {businessInfo.heritage.specialties.map((specialty, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Award className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                    <span className="text-sm md:text-base text-gray-700 dark:text-gray-300">{specialty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-luxury-charcoal dark:text-luxury-pearl mb-4">
              Contact Information
            </h2>
            <div className="space-y-3">
              {businessInfo?.contact?.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-luxury-gold" />
                  <a 
                    href={`tel:${businessInfo.contact.phone}`}
                    className="text-sm md:text-base text-gray-700 dark:text-gray-300 hover:text-luxury-gold"
                  >
                    {businessInfo.contact.phone}
                  </a>
                </div>
              )}
              
              {businessInfo?.contact?.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-luxury-gold" />
                  <a 
                    href={`mailto:${businessInfo.contact.email}`}
                    className="text-sm md:text-base text-gray-700 dark:text-gray-300 hover:text-luxury-gold"
                  >
                    {businessInfo.contact.email}
                  </a>
                </div>
              )}

              {businessInfo?.address?.fullAddress && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-luxury-gold mt-0.5" />
                  <div className="text-sm md:text-base text-gray-700 dark:text-gray-300">
                    {businessInfo.address.fullAddress}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 