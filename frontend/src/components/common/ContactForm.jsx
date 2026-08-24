import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Phone, MessageSquare, AlertCircle } from 'lucide-react';
import { useBusinessContext } from '../../context/BusinessContext';

const ContactForm = ({ className = "" }) => {
  const { generateWhatsAppURL } = useBusinessContext();

  // Form data - simplified (WhatsApp first)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Minimal validation: only message required; phone/name optional
  const validateForm = () => {
    const newErrors = {};

    if (!formData.message.trim()) {
      newErrors.message = 'Please write a message';
    } else if (formData.message.trim().length < 5) {
      newErrors.message = 'Message is too short';
    }

    if (formData.phone && !/^[+]?[\d\s-()]{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Enter a valid phone (or leave empty)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Build a clean, human message (no template noise)
      const lines = [];
      if (formData.name) lines.push(`Hi, I'm ${formData.name}.`);
      if (formData.message) lines.push('', formData.message.trim());
      if (formData.phone) lines.push('', `Phone: ${formData.phone}`);

      const finalMessage = lines.join('\n');
        
      // Open WhatsApp directly
      const whatsappData = generateWhatsAppURL(null, finalMessage);
      if (whatsappData && whatsappData.open) {
        whatsappData.open();
      } else {
        const url = typeof whatsappData === 'string' ? whatsappData : whatsappData.webUrl;
        window.open(url, '_blank');
      }

      // Optional UX reset
      setFormData({ name: '', phone: '', message: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name (optional)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`
                  w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sapphire dark:bg-gray-700 dark:border-gray-600 dark:text-white
                  ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}
                `}
                placeholder="Your full name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone (optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`
                  w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sapphire dark:bg-gray-700 dark:border-gray-600 dark:text-white
                  ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}
                `}
                placeholder="+91 98765 43210"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message *
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className={`
                w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sapphire dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none
                ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}
              `}
              placeholder="Type your message for WhatsApp..."
            />
          </div>
          {errors.message && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.message.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Opening WhatsApp...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              <span>Send on WhatsApp</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactForm; 