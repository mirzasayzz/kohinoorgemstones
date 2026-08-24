import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, MessageCircle, Gem, Shield, Clock, ExternalLink } from 'lucide-react';
import Toast from './Toast';
import { aiService } from '../../services/api';

// Component to render suggested gemstone cards
const GemstoneCard = ({ gemstone }) => {
  const handleViewGemstone = () => {
    const url = `/gemstone/${gemstone.slug || gemstone._id}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-luxury-charcoal border border-luxury-platinum/30 dark:border-luxury-charcoal/30 rounded-xl p-3 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={handleViewGemstone}
    >
      <div className="flex items-center space-x-3">
        {/* Gemstone image or placeholder */}
        <div className="w-12 h-12 bg-luxury-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
          {gemstone.images && gemstone.images.length > 0 ? (
            <img 
              src={gemstone.images[0]} 
              alt={gemstone.name.english}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Gem className="w-6 h-6 text-luxury-gold" />
          )}
        </div>
        
        {/* Gemstone details */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-luxury-charcoal dark:text-luxury-pearl truncate">
            {gemstone.name.english}
          </div>
          <div className="text-xs text-neutral-warm-600 dark:text-neutral-warm-400">
            {gemstone.category}
          </div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {gemstone.priceRange?.min || gemstone.priceRange?.max ? (
              <>
                <span className="text-emerald-500">₹</span>
                {gemstone.priceRange.min && gemstone.priceRange.max ? 
                  `${gemstone.priceRange.min.toLocaleString('en-IN')} - ₹${gemstone.priceRange.max.toLocaleString('en-IN')}` :
                  gemstone.priceRange.min ? 
                    `${gemstone.priceRange.min.toLocaleString('en-IN')}+` :
                    `Up to ₹${gemstone.priceRange.max.toLocaleString('en-IN')}`
                }
              </>
            ) : (
              'Price on request'
            )}
          </div>
        </div>
        
        {/* View button */}
        <ExternalLink className="w-4 h-4 text-luxury-gold flex-shrink-0" />
      </div>
    </motion.div>
  );
};

const GemstoneAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(15);
  const [lastRequestTime, setLastRequestTime] = useState(null);
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const checkRateLimit = () => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    if (lastRequestTime && (now - lastRequestTime) > oneHour) {
      setRateLimitRemaining(15);
      setLastRequestTime(null);
    }
    
    return rateLimitRemaining > 0;
  };

  const validateGemstoneQuery = (message) => {
    // More permissive validation - block only obviously malicious content
    const maliciousPatterns = [
      /hack|crack|exploit|inject/i,
      /virus|malware|phishing/i,
      /password|login|admin|database/i,
      /porn|adult|explicit|sexual/i,
      /\b(fuck|shit|damn)\b/i // Basic profanity filter
    ];
    
    // Check for malicious patterns
    if (maliciousPatterns.some(pattern => pattern.test(message))) {
      return false;
    }
    
    // Allow almost everything else - let the AI handle context and guide the conversation
    return true;
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    // Rate limiting check
    if (!checkRateLimit()) {
      showToast('Rate limit exceeded. Please wait before making another request.', 'error');
      return;
    }

    // Validate for malicious content only
    if (!validateGemstoneQuery(inputValue)) {
      showToast('Message contains inappropriate content. Please keep your questions respectful.', 'warning');
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const data = await aiService.chatWithAI(userMessage, 'gemstone_recommendation');

      const newMessage = { 
        type: 'ai', 
        content: data.response,
        gemstones: data.suggestedGemstones || []
      };
      
      setMessages(prev => [...prev, newMessage]);
      setRateLimitRemaining(prev => prev - 1);
      setLastRequestTime(Date.now());
      
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      }]);
      showToast('Failed to get AI response. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([{
        type: 'ai',
        content: "Hi! I'm Kohinoor AI. I'll help you find the perfect gemstone. What's your name and what occasion is this for?"
      }]);
    }
  };

  return (
    <>
      {/* Floating AI Assistant Button */}
      <motion.div
        className="fixed right-4 bottom-20 md:bottom-6 z-50"
        initial={{ scale: 0, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6, type: "spring", stiffness: 200 }}
      >
        <motion.button
          onClick={handleOpen}
          className="relative group bg-gradient-to-r from-luxury-gold via-yellow-400 to-amber-500 hover:from-amber-500 hover:via-yellow-500 hover:to-luxury-gold rounded-2xl shadow-2xl hover:shadow-luxury transition-all duration-300 overflow-hidden border-2 border-white/20"
          whileHover={{ scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Sparkle animations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-2 left-3 w-1 h-1 bg-white rounded-full animate-ping"></div>
            <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-3 left-2 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-2 right-2 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </div>
          
          <div className="relative z-10 px-4 py-3 flex items-center space-x-2">
            <div className="flex items-center">
              <Gem className="w-5 h-5 text-white drop-shadow-lg group-hover:animate-bounce" />
              <Sparkles className="w-4 h-4 text-white ml-1 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-sm leading-tight drop-shadow-md">
                Kohinoor AI
              </div>
              <div className="text-white/90 font-medium text-xs leading-tight drop-shadow-md">
                Find Gemstones ✨
              </div>
            </div>
          </div>
          
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-luxury-gold animate-ping opacity-30 group-hover:opacity-50"></div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-luxury-gold to-amber-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl scale-110"></div>
        </motion.button>

        {/* Floating notification badge */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2, duration: 0.4 }}
          className="absolute -top-2 -right-2 bg-luxury-ruby text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse"
        >
          AI
        </motion.div>
      </motion.div>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full max-w-md bg-white dark:bg-luxury-charcoal rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-luxury-gold via-yellow-400 to-amber-500 p-4 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Gem className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Kohinoor AI</h3>
                      <div className="flex items-center space-x-2 text-sm text-white/90">
                        <Shield className="w-3 h-3" />
                        <span>Secured & Rate Limited</span>
                        <Clock className="w-3 h-3 ml-2" />
                        <span>{rateLimitRemaining}/15 left</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-luxury-gold/20">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${
                      message.type === 'user' ? 'ml-auto' : 'mr-auto'
                    }`}>
                      {/* Main message bubble */}
                      <div className={`p-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-luxury-gold text-white rounded-br-md'
                          : 'bg-luxury-champagne dark:bg-luxury-charcoal/50 text-luxury-charcoal dark:text-luxury-pearl rounded-bl-md'
                      }`}>
                        <div className="flex items-start space-x-2">
                          {message.type === 'ai' && (
                            <Gem className="w-4 h-4 mt-0.5 text-luxury-gold flex-shrink-0" />
                          )}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                      
                      {/* Suggested gemstones */}
                      {message.type === 'ai' && message.gemstones && message.gemstones.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs text-neutral-warm-600 dark:text-neutral-warm-400 mb-2 flex items-center">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Suggested by Kohinoor:
                          </div>
                          {message.gemstones.map((gemstone, gemIndex) => (
                            <GemstoneCard key={gemstone._id || gemIndex} gemstone={gemstone} />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-luxury-champagne dark:bg-luxury-charcoal/50 p-3 rounded-2xl rounded-bl-md">
                      <div className="flex items-center space-x-2">
                        <Gem className="w-4 h-4 text-luxury-gold animate-pulse" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-luxury-gold rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-luxury-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-luxury-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-luxury-platinum/20 dark:border-luxury-charcoal/20">
                <div className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask Kohinoor AI..."
                      className="w-full max-h-32 p-3 pr-12 border border-luxury-platinum/30 dark:border-luxury-charcoal/30 rounded-2xl bg-luxury-champagne/50 dark:bg-luxury-charcoal/30 text-luxury-charcoal dark:text-luxury-pearl placeholder-neutral-warm-500 dark:placeholder-neutral-warm-400 resize-none focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 focus:border-luxury-gold transition-all duration-200"
                      rows="1"
                      disabled={isLoading || rateLimitRemaining === 0}
                    />
                    <div className="absolute right-3 bottom-3 text-xs text-neutral-warm-400">
                      {inputValue.length}/100
                    </div>
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading || rateLimitRemaining === 0}
                    className="w-12 h-12 bg-luxury-gold hover:bg-luxury-gold/90 disabled:bg-neutral-warm-300 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                {rateLimitRemaining <= 1 && (
                  <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {rateLimitRemaining === 0 
                        ? 'Rate limit reached. Reset in 1 hour.' 
                        : `${rateLimitRemaining} request remaining this hour.`
                      }
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default GemstoneAI; 