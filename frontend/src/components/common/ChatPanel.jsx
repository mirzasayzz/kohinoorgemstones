import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Loader2, X, ChevronDown, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import SlidePanel from './SlidePanel';

const ChatPanel = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const { 
    isConnected, 
    messages, 
    setMessages,
    isTyping, 
    sendMessage: socketSendMessage, 
    sendTyping,
    markAsRead,
    loadMessages 
  } = useSocket();
  
  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Load messages when panel opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      setInitialLoading(true);
      loadMessages().finally(() => setInitialLoading(false));
      markAsRead();
    }
  }, [isOpen, isAuthenticated, loadMessages, markAsRead]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages]);

  // Handle scroll detection
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  const scrollToBottom = (behavior = 'smooth') => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    sendTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  }, [sendTyping]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    
    const messageText = input.trim();
    setInput('');
    setSending(true);
    sendTyping(false);

    // Send via socket (optimistic update handled by socket context)
    const success = socketSendMessage(messageText);
    
    if (!success) {
      // Fallback: Socket not connected, show error
      console.error('Failed to send message - socket not connected');
    }
    
    setSending(false);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title=""
      showHeader={false}
    >
      <div className="flex flex-col h-full">
        {/* Custom Header - Fixed */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold flex items-center gap-2">
                  Let's Talk
                  {isConnected ? (
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Connected" />
                  ) : (
                    <span className="w-2 h-2 bg-red-400 rounded-full" title="Disconnected" />
                  )}
                </h2>
                <p className="text-amber-100 text-xs">
                  {isTyping ? 'Admin is typing...' : 'We reply within hours'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Messages Container - Scrollable */}
        <div className="flex-1 relative overflow-hidden bg-neutral-50 dark:bg-neutral-950">
          <div 
            ref={messagesContainerRef}
            className="h-full overflow-y-auto p-4 space-y-3 scroll-smooth"
          >
            {initialLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No messages yet</p>
                <p className="text-sm">Start a conversation with us!</p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg._id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                        msg.sender === 'customer'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-br-sm'
                          : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'customer' ? 'text-amber-100/80' : 'text-neutral-400'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} className="h-1" />
              </>
            )}
          </div>

          {/* Scroll to Bottom Button */}
          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => scrollToBottom('smooth')}
                className="absolute bottom-4 right-4 bg-white dark:bg-neutral-800 shadow-lg rounded-full p-2 hover:scale-110 transition-transform"
              >
                <ChevronDown className="w-5 h-5 text-amber-600" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Input Section - Fixed Bottom */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              disabled={!isConnected}
              className="flex-1 bg-neutral-100 dark:bg-neutral-800 border-0 rounded-full px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none disabled:opacity-50"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={sending || !input.trim() || !isConnected}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-2.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </SlidePanel>
  );
};

export default ChatPanel;
