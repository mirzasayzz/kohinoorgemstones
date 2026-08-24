import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_CONFIG } from '../config/config';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Get socket URL from API config
  const getSocketUrl = () => {
    const baseUrl = API_CONFIG.BASE_URL;
    // Remove /api from the URL to get the base server URL
    return baseUrl.replace('/api', '');
  };

  // Connect to socket
  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('kohinoor_token');
    if (!token) return;

    const socketUrl = getSocketUrl();
    
    const newSocket = io(socketUrl, {
      auth: {
        token,
        userType: 'customer'
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      reconnectAttempts.current++;
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.log('Max reconnection attempts reached');
      }
    });

    // Listen for new messages
    newSocket.on('newMessage', (data) => {
      const { message, fromAdmin } = data;
      
      // Only add message if it's from admin (not our own echoed message)
      if (fromAdmin) {
        setMessages(prev => [...prev, message]);
        setUnreadCount(prev => prev + 1);
      }
    });

    // Listen for typing indicator
    newSocket.on('adminTyping', (data) => {
      setIsTyping(data.isTyping);
    });

    // Listen for messages being read
    newSocket.on('messagesRead', () => {
      // Update read status in messages
      setMessages(prev => prev.map(msg => ({
        ...msg,
        isRead: true,
        readAt: new Date()
      })));
    });

    // Listen for message sent confirmation
    newSocket.on('messageSent', (data) => {
      if (data.success && data.message) {
        // Replace temp message with real one (no duplicates)
        setMessages(prev => {
          // Find and replace temp message
          const tempIndex = prev.findIndex(msg => msg._id === 'temp');
          if (tempIndex !== -1) {
            const newMessages = [...prev];
            newMessages[tempIndex] = data.message;
            return newMessages;
          }
          // If no temp message found, don't add duplicate
          return prev;
        });
      }
    });

    // Listen for errors
    newSocket.on('error', (data) => {
      console.error('Socket error:', data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated]);

  // Send message
  const sendMessage = useCallback((message) => {
    if (!socket || !isConnected) {
      console.error('Socket not connected');
      return false;
    }

    // Add optimistic message
    const tempMessage = {
      _id: 'temp',
      content: message,
      sender: 'customer',
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, tempMessage]);

    // Send via socket
    socket.emit('sendMessage', { message });
    return true;
  }, [socket, isConnected]);

  // Send typing indicator
  const sendTyping = useCallback((isTyping) => {
    if (socket && isConnected) {
      socket.emit('typing', { isTyping });
    }
  }, [socket, isConnected]);

  // Mark messages as read
  const markAsRead = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('markRead', {});
      setUnreadCount(0);
    }
  }, [socket, isConnected]);

  // Load initial messages (fallback to REST API)
  const loadMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('kohinoor_token');
      const res = await fetch(`${API_CONFIG.BASE_URL}/customer/chat/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Load messages error:', error);
    }
  }, []);

  // Clear messages (for logout)
  const clearMessages = useCallback(() => {
    setMessages([]);
    setUnreadCount(0);
  }, []);

  const value = {
    socket,
    isConnected,
    messages,
    setMessages,
    unreadCount,
    setUnreadCount,
    isTyping,
    sendMessage,
    sendTyping,
    markAsRead,
    loadMessages,
    clearMessages
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
