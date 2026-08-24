import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Shield, 
  Heart,
  Star,
  Gem,
  MessageCircle,
  Phone
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import SEOHead, { seoConfigs } from '../components/common/SEOHead';

const About = () => {
  const { businessInfo, generateWhatsAppURL } = useBusiness();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead {...seoConfigs.about} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-sapphire via-emerald to-golden py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Crown className="w-10 h-10 text-white" />
              <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white">
                About {businessInfo?.shopName || 'Kohinoor'}
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {businessInfo?.tagline || 'Premium Gemstones for Life\'s Precious Moments'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Story
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
            >
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  {businessInfo?.description || 'We are a family-owned gemstone business dedicated to providing authentic, certified gemstones with a heritage of trust and excellence.'}
                </p>
                
                {businessInfo?.heritage?.story && (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    {businessInfo.heritage.story}
                  </p>
                )}

                {businessInfo?.heritage?.foundedYear && (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Founded in {businessInfo.heritage.foundedYear}, we have been serving customers with the same commitment to quality and authenticity.
                  </p>
                )}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    const whatsappData = generateWhatsAppURL();
                    if (whatsappData && whatsappData.open) {
                      whatsappData.open();
                    } else {
                      const url = typeof whatsappData === 'string' ? whatsappData : whatsappData.webUrl;
                      window.open(url, '_blank');
                    }
                  }}
                  className="btn-primary"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Connect with Us
                </button>
                <a href={`tel:${businessInfo?.contact?.phone}`} className="btn-secondary">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Directly
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      {businessInfo?.heritage?.specialties && businessInfo.heritage.specialties.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Our Specialties
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businessInfo.heritage.specialties.map((specialty, index) => (
                <motion.div
                  key={index}
            initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-golden flex-shrink-0" />
                    <span className="font-medium text-gray-900 dark:text-white">{specialty}</span>
                  </div>
          </motion.div>
              ))}
            </div>
        </div>
      </section>
      )}

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-sapphire to-emerald rounded-xl p-8 text-white"
          >
            <h2 className="font-heading text-3xl font-bold mb-4">
              Experience Quality Gemstones
              </h2>
            <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              Let our expertise guide you to the perfect stone for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/gemstones" className="bg-white text-sapphire hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold flex items-center justify-center transition-colors">
                <Gem className="w-5 h-5 mr-2" />
                Explore Our Collection
              </a>
              <button
                onClick={() => {
                  const whatsappData = generateWhatsAppURL();
                  if (whatsappData && whatsappData.open) {
                    whatsappData.open();
                  } else {
                    const url = typeof whatsappData === 'string' ? whatsappData : whatsappData.webUrl;
                    window.open(url, '_blank');
                  }
                }}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-sapphire px-6 py-3 rounded-lg font-semibold flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Get Expert Guidance
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About; 