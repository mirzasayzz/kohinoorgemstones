import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CustomerChat = () => {
  const { customer, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const lockRef = useRef(false); // Mutex lock for sending
  const lastSentRef = useRef(''); // Track last sent message content

  // Only show for authenticated users
  if (!isAuthenticated || !customer) {
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      markAsRead();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for unread messages periodically
  useEffect(() => {
    const checkUnread = async () => {
      try {
        const response = await api.get('/customer/chat/unread');
        if (response.data.success) {
          setUnreadCount(response.data.unreadCount);
        }
      } catch (error) {
        console.error('Check unread error:', error);
      }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/customer/chat/messages');
      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await api.post('/customer/chat/read');
      setUnreadCount(0);
    } catch (error) {
      console.error('Mark read error:', error);
    }
  };

  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const messageText = inputValue.trim();
    
    // Multiple guards against double send
    if (!messageText) return;
    if (lockRef.current) return;
    if (isSending) return;
    if (lastSentRef.current === messageText) return; // Same message check
    
    // Lock immediately
    lockRef.current = true;
    lastSentRef.current = messageText;
    setIsSending(true);
    setInputValue('');
    
    try {
      const response = await api.post('/customer/chat/send', { message: messageText });
      const newMessage = response.message || response.data?.message;
      
      if (newMessage && newMessage._id) {
        setMessages(prev => {
          // Check if message already exists
          const exists = prev.some(m => m._id === newMessage._id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
      }
    } catch (error) {
      console.error('Send message error:', error);
      setInputValue(messageText);
      lastSentRef.current = ''; // Allow retry
    } finally {
      setIsSending(false);
      // Keep lock for 1 second to prevent rapid re-sends
      setTimeout(() => {
        lockRef.current = false;
        lastSentRef.current = '';
      }, 1000);
    }
  }, [inputValue, isSending]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-20 md:right-6 md:bottom-6 z-40 w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed right-4 bottom-24 md:right-6 md:bottom-24 z-50 w-80 md:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Chat with Us</h3>
                  <p className="text-xs text-white/80">We typically reply within minutes</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Hi {customer.name}! 👋<br />
                    How can we help you today?
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={msg._id || index}
                    className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                        msg.sender === 'customer'
                          ? 'bg-emerald-500 text-white rounded-br-md'
                          : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === 'customer' ? 'text-white/70' : 'text-gray-400'
                      }`}>
                        {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                          timeZone: 'Asia/Kolkata'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isSending || lockRef.current}
                  className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CustomerChat;
