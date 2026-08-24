import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, RotateCcw, ExternalLink, Sparkles } from 'lucide-react';
import Toast from './Toast';
import { aiService } from '../../services/api';

// Modern AI Logo Component - Golden Theme
const KohinoorAILogo = ({ size = 'md', animated = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  
  return (
    <div className={`${sizeClasses[size]} relative`}>
      {/* Outer glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-xl blur-sm opacity-60"></div>
      
      {/* Main container */}
      <div className="relative w-full h-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
        {/* AI Brain/Neural Icon */}
        <svg viewBox="0 0 24 24" className={`w-2/3 h-2/3 text-white ${animated ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.5">
          {/* Central node */}
          <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.9"/>
          {/* Neural connections */}
          <path d="M12 9V4M12 15v5M9 12H4M15 12h5" strokeLinecap="round"/>
          <path d="M9.5 9.5L6 6M14.5 9.5L18 6M9.5 14.5L6 18M14.5 14.5L18 18" strokeLinecap="round" opacity="0.7"/>
          {/* Outer dots */}
          <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
          <circle cx="12" cy="20" r="1.5" fill="currentColor"/>
          <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="20" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="6" cy="6" r="1" fill="currentColor" opacity="0.7"/>
          <circle cx="18" cy="6" r="1" fill="currentColor" opacity="0.7"/>
          <circle cx="6" cy="18" r="1" fill="currentColor" opacity="0.7"/>
          <circle cx="18" cy="18" r="1" fill="currentColor" opacity="0.7"/>
        </svg>
      </div>
      
      {/* Sparkle accent */}
      {animated && (
        <motion.div 
          className="absolute -top-1 -right-1"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-3 h-3 text-yellow-400" />
        </motion.div>
      )}
    </div>
  );
};

// Floating AI Button - Modern with Name
const AIFloatingButton = ({ onClick }) => (
  <motion.button
    onClick={onClick}
    className="fixed right-3 sm:right-4 bottom-6 z-40 group"
    initial={{ scale: 0, opacity: 0, x: 100 }}
    animate={{ scale: 1, opacity: 1, x: 0 }}
    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {/* Outer glow */}
    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity animate-pulse"></div>
    
    {/* Main Button */}
    <div className="relative flex items-center gap-2 pl-1.5 pr-3 py-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 rounded-2xl shadow-2xl shadow-amber-500/50 overflow-hidden border border-yellow-300/30">
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      {/* Beautiful AI Logo */}
      <div className="relative w-10 h-10 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-xl flex items-center justify-center shadow-inner overflow-hidden">
        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-orange-500/20"></div>
        {/* Diamond icon */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-400 drop-shadow-lg" fill="currentColor">
            <path d="M12 2L2 9l10 13 10-13-10-7zM12 4.5l6.5 4.5H5.5L12 4.5zM4.5 10.5h15L12 19.5l-7.5-9z"/>
          </svg>
        </motion.div>
        {/* Sparkle */}
        <motion.div 
          className="absolute top-1 right-1"
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Sparkles className="w-2 h-2 text-yellow-300" />
        </motion.div>
      </div>
      
      {/* Text - Kohinoor AI on all screens */}
      <span className="relative font-bold text-neutral-900 tracking-tight text-xs sm:text-sm">
        Kohinoor AI
      </span>
    </div>
  </motion.button>
);

// Beautiful gemstone suggestion card - clickable
const GemstoneCard = ({ gemstone }) => {
  const getImageUrl = () => {
    if (!gemstone.images || gemstone.images.length === 0) return null;
    const firstImage = gemstone.images[0];
    return typeof firstImage === 'string' ? firstImage : firstImage?.url;
  };

  const imageUrl = getImageUrl();
  const gemstoneUrl = `/gemstone/${gemstone.slug || gemstone._id}`;

  return (
    <a
      href={gemstoneUrl}
      className="block bg-gradient-to-br from-amber-50 to-orange-50 dark:from-neutral-800 dark:to-neutral-700 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all hover:scale-[1.02] border border-amber-200 dark:border-amber-500/30"
    >
      {/* Image */}
      <div className="h-24 overflow-hidden bg-neutral-200 dark:bg-neutral-600 relative">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={gemstone.name?.english || 'Gemstone'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <Sparkles className="w-8 h-8" />
          </div>
        )}
        {/* Badge */}
        {gemstone.certification?.certified && (
          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">
            Certified
          </div>
        )}
      </div>
      
      {/* Details */}
      <div className="p-2.5">
        <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
          {gemstone.name?.english || 'Gemstone'}
        </p>
        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-1">{gemstone.category}</p>
        
        {/* Purpose tags */}
        {gemstone.purpose && gemstone.purpose.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {gemstone.purpose.slice(0, 2).map((p, i) => (
              <span key={i} className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">
                {p}
              </span>
            ))}
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            ₹{(gemstone.price || gemstone.priceRange?.min || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">View →</span>
        </div>
      </div>
    </a>
  );
};

// Quick suggestions - Conversational starters
const QUICK_SUGGESTIONS = [
  { text: "I'm looking for a gift", icon: '🎁' },
  { text: 'Something for my wedding', icon: '💍' },
  { text: "What's good for my zodiac?", icon: '✨' },
  { text: 'Show me popular ones', icon: '🔥' },
];

// Purpose-based suggestions
const PURPOSE_SUGGESTIONS = [
  { text: 'For meditation & peace', icon: '🧘' },
  { text: 'For love & relationships', icon: '💕' },
  { text: 'For wealth & prosperity', icon: '💎' },
  { text: 'For healing & health', icon: '🌿' },
  { text: 'For protection & safety', icon: '🛡️' },
  { text: 'For career & success', icon: '📈' },
];

// AI Typing Indicator
const TypingIndicator = () => (
  <div className="flex items-start gap-2.5">
    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
      <span className="text-sm">💎</span>
    </div>
    <div className="bg-white dark:bg-neutral-800 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm">
      <div className="flex gap-1">
        <motion.div 
          className="w-2 h-2 bg-amber-500 rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
        />
        <motion.div 
          className="w-2 h-2 bg-amber-500 rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: 0.12 }}
        />
        <motion.div 
          className="w-2 h-2 bg-amber-500 rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: 0.24 }}
        />
      </div>
    </div>
  </div>
);

const GemstoneAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(15);
  const [lastRequestTime, setLastRequestTime] = useState(null);
  const [toast, setToast] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);

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

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;
    
    // Rate limiting check
    if (!checkRateLimit()) {
      showToast('Rate limit exceeded. Please wait before making another request.', 'error');
      return;
    }

    // Validate for malicious content only
    if (!validateGemstoneQuery(messageText)) {
      showToast('Message contains inappropriate content. Please keep your questions respectful.', 'warning');
      return;
    }

    const userMessage = messageText.trim();
    setInputValue('');
    setShowQuickActions(false);
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const data = await aiService.chatWithAI(userMessage, 'gemstone_recommendation');

      const newMessage = { 
        type: 'ai', 
        content: data.response,
        gemstones: data.suggestedGemstones || [],
        extractedParams: data.extractedParams || {}
      };
      
      setMessages(prev => [...prev, newMessage]);
      setRateLimitRemaining(data.rateLimitRemaining || rateLimitRemaining - 1);
      setLastRequestTime(Date.now());
      
    } catch (error) {
      console.error('Error:', error);
      
      // Beautiful fallback message with suggestions when API fails
      const fallbackMessages = [
        "Hey! 💎 I'm taking a quick break right now, but don't worry - I've got some amazing gems picked out for you! Check these beauties below 👇",
        "Oops! My brain needs a little rest 😅 But here are some stunning gemstones I think you'll love! Take a look below ✨",
        "I'm a bit busy right now, but I didn't want to leave you empty-handed! Here are some of our finest gems just for you 💎",
        "Taking a quick breather! 🌟 Meanwhile, feast your eyes on these gorgeous gemstones I've selected for you below!"
      ];
      
      const fallbackMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
      
      // Try to fetch some trending gemstones as suggestions
      let fallbackGemstones = [];
      try {
        const { gemstoneService } = await import('../../services/api');
        const response = await gemstoneService.getTrendingGemstones();
        if (response.success && response.data?.gemstones) {
          fallbackGemstones = response.data.gemstones.slice(0, 4);
        }
      } catch (fetchError) {
        console.log('Could not fetch fallback gemstones');
      }
      
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: fallbackMessage,
        gemstones: fallbackGemstones,
        isServiceDown: true
      }]);
      
      // Don't show error toast, we're handling it gracefully
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    await sendMessage(inputValue);
  };

  const handleQuickAction = async (action) => {
    await sendMessage(action.message);
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
      // Check for logged-in user
      let userName = null;
      try {
        const storedUser = localStorage.getItem('kohinoor_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          userName = user.name;
        }
      } catch (e) {
        console.log('Could not get user info');
      }
      
      let welcomeMessage;
      if (userName) {
        // Personalized greeting for logged-in users
        const personalizedMessages = [
          `Hey ${userName}! 👋 Great to see you! I'm Kohinoor - your personal gemstone buddy. What can I help you find today?`,
          `Hi ${userName}! 💎 Welcome back! Looking for something special? Tell me what's on your mind!`,
          `Hey ${userName}! ✨ I remember you! Ready to find your perfect gemstone? What are you looking for?`
        ];
        welcomeMessage = personalizedMessages[Math.floor(Math.random() * personalizedMessages.length)];
      } else {
        // Generic greeting for guests
        const guestMessages = [
          "Hey there! 👋 I'm Kohinoor - your gemstone buddy. What brings you here today?",
          "Hi! 💎 I'm Kohinoor. Looking for something special? Tell me what's on your mind!",
          "Hey! Welcome to Kohinoor ✨ I'd love to help you find the perfect gem. What are you looking for?"
        ];
        welcomeMessage = guestMessages[Math.floor(Math.random() * guestMessages.length)];
      }
      
      setMessages([{ type: 'ai', content: welcomeMessage }]);
      setShowQuickActions(true);
    }
  };

  const handleReset = () => {
    aiService.resetSession();
    
    // Check for logged-in user
    let userName = null;
    try {
      const storedUser = localStorage.getItem('kohinoor_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        userName = user.name;
      }
    } catch (e) {}
    
    let resetMessage;
    if (userName) {
      const personalizedResets = [
        `Fresh start, ${userName}! 😊 What can I help you find now?`,
        `Alright ${userName}, let's start over! 💎 What are you looking for?`,
        `New chat, ${userName}! ✨ Tell me what you need today?`
      ];
      resetMessage = personalizedResets[Math.floor(Math.random() * personalizedResets.length)];
    } else {
      const guestResets = [
        "Fresh start! 😊 So, what can I help you find today?",
        "Alright, let's start over! 💎 What are you looking for?",
        "New chat! ✨ Tell me what brought you here today?"
      ];
      resetMessage = guestResets[Math.floor(Math.random() * guestResets.length)];
    }
    
    setMessages([{ type: 'ai', content: resetMessage }]);
    setShowQuickActions(true);
    setInputValue('');
  };

  return (
    <>
      {/* Modern AI Floating Button */}
      <AIFloatingButton onClick={handleOpen} />

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full h-[85vh] sm:h-[70vh] lg:h-[75vh] max-w-[100%] sm:max-w-lg lg:max-w-xl xl:max-w-2xl bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Clean Modern Header - Fixed */}
              <div className="relative flex-shrink-0">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.15),transparent_50%)]"></div>
                
                <div className="relative px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <span className="text-xl">💎</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        Kohinoor
                      </h3>
                      <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                        Your gemstone buddy
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleReset}
                      className="p-2.5 hover:bg-white/10 rounded-xl transition-colors group"
                      title="Start fresh"
                    >
                      <RotateCcw className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2.5 hover:bg-white/10 rounded-xl transition-colors group"
                    >
                      <X className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-neutral-950">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'ai' && (
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                          <span className="text-sm">💎</span>
                        </div>
                        <div className="max-w-[80%]">
                          <div className={`px-4 py-3 rounded-2xl rounded-tl-md text-sm shadow-sm ${
                            message.isError 
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                          }`}>
                            <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          </div>
                          
                          {/* Gemstone suggestions - Grid layout */}
                          {message.gemstones && message.gemstones.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-neutral-500 px-1 flex items-center gap-1 mb-2">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                <span className="font-medium">Recommended for you:</span>
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {message.gemstones.slice(0, 4).map((gemstone, gemIndex) => (
                                  <GemstoneCard key={gemstone._id || gemIndex} gemstone={gemstone} />
                                ))}
                              </div>
                              {message.gemstones.length > 4 && (
                                <a
                                  href="/gemstones"
                                  className="block text-center text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 py-2 font-medium mt-2"
                                >
                                  View all {message.gemstones.length} gemstones →
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {message.type === 'user' && (
                      <div className="max-w-[75%]">
                        <div className="px-4 py-3 rounded-2xl rounded-tr-md text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Quick Suggestions */}
                {showQuickActions && messages.length === 1 && !isLoading && (
                  <div className="pt-2 space-y-4">
                    {/* General suggestions */}
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2 px-1">🎯 Quick options:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => sendMessage(suggestion.text)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-700 dark:text-neutral-300 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all shadow-sm hover:shadow flex items-center gap-2"
                          >
                            <span className="text-base">{suggestion.icon}</span>
                            <span className="text-left text-xs leading-tight">{suggestion.text}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Purpose suggestions */}
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2 px-1">✨ Find by purpose:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {PURPOSE_SUGGESTIONS.map((suggestion, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => sendMessage(suggestion.text)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-3 py-2 text-sm bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-xl text-purple-700 dark:text-purple-300 hover:border-purple-400 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all shadow-sm hover:shadow flex items-center gap-2"
                          >
                            <span className="text-base">{suggestion.icon}</span>
                            <span className="text-left text-xs leading-tight">{suggestion.text}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Loading indicator */}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Clean Input Area - Fixed at bottom */}
              <div className="flex-shrink-0 p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                    disabled={isLoading}
                  />
                  <motion.button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="w-11 h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
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