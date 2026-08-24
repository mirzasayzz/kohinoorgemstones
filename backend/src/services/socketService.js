import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import Customer from '../models/Customer.js';

let io;

// Store connected users
const connectedUsers = new Map(); // customerId -> socketId
const connectedAdmins = new Set(); // Set of admin socket IDs

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const userType = socket.handshake.auth.userType; // 'customer' or 'admin'
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (userType === 'admin') {
        socket.userType = 'admin';
        socket.userId = decoded.id;
      } else {
        // Verify customer exists
        const customer = await Customer.findById(decoded.id);
        if (!customer) {
          return next(new Error('Customer not found'));
        }
        socket.userType = 'customer';
        socket.userId = decoded.id;
        socket.customerName = customer.name;
      }
      
      next();
    } catch (error) {
      console.error('Socket auth error:', error.message);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.userType} - ${socket.userId}`);
    
    // Join user to their room
    if (socket.userType === 'customer') {
      socket.join(`customer:${socket.userId}`);
      connectedUsers.set(socket.userId, socket.id);
      
      // Notify admins that customer is online
      io.to('admins').emit('customerOnline', {
        customerId: socket.userId,
        customerName: socket.customerName
      });
    } else if (socket.userType === 'admin') {
      socket.join('admins');
      connectedAdmins.add(socket.id);
      
      // Send list of online customers to admin
      const onlineCustomers = Array.from(connectedUsers.keys());
      socket.emit('onlineCustomers', onlineCustomers);
    }

    // Handle customer sending message
    socket.on('sendMessage', async (data) => {
      try {
        const { message, customerId } = data;
        
        if (!message || message.trim().length === 0) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        let targetCustomerId = customerId;
        let sender = socket.userType;
        
        // If customer is sending, use their ID
        if (socket.userType === 'customer') {
          targetCustomerId = socket.userId;
        }

        // Create message in database
        const newMessage = await Message.create({
          customer: targetCustomerId,
          content: message.trim(),
          sender: sender,
          adminUser: socket.userType === 'admin' ? socket.userId : undefined
        });

        // Populate for response
        const populatedMessage = await Message.findById(newMessage._id)
          .populate('customer', 'name avatar')
          .populate('adminUser', 'name');

        // Emit to customer
        io.to(`customer:${targetCustomerId}`).emit('newMessage', {
          message: populatedMessage,
          fromAdmin: sender === 'admin'
        });

        // Emit to all admins
        io.to('admins').emit('newMessage', {
          message: populatedMessage,
          customerId: targetCustomerId,
          fromCustomer: sender === 'customer'
        });

        // Confirm to sender
        socket.emit('messageSent', { 
          success: true, 
          message: populatedMessage 
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      if (socket.userType === 'customer') {
        // Notify admins that customer is typing
        io.to('admins').emit('customerTyping', {
          customerId: socket.userId,
          customerName: socket.customerName,
          isTyping: data.isTyping
        });
      } else if (socket.userType === 'admin') {
        // Notify specific customer that admin is typing
        io.to(`customer:${data.customerId}`).emit('adminTyping', {
          isTyping: data.isTyping
        });
      }
    });

    // Handle marking messages as read
    socket.on('markRead', async (data) => {
      try {
        const { customerId } = data;
        
        if (socket.userType === 'admin') {
          // Admin marking customer messages as read
          await Message.updateMany(
            { customer: customerId, sender: 'customer', isRead: false },
            { isRead: true, readAt: new Date() }
          );
          
          // Notify customer their messages were read
          io.to(`customer:${customerId}`).emit('messagesRead', {
            readBy: 'admin'
          });
        } else if (socket.userType === 'customer') {
          // Customer marking admin messages as read
          await Message.updateMany(
            { customer: socket.userId, sender: 'admin', isRead: false },
            { isRead: true, readAt: new Date() }
          );
        }
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Handle join specific chat (for admins)
    socket.on('joinChat', (customerId) => {
      if (socket.userType === 'admin') {
        socket.join(`chat:${customerId}`);
      }
    });

    // Handle leave chat
    socket.on('leaveChat', (customerId) => {
      if (socket.userType === 'admin') {
        socket.leave(`chat:${customerId}`);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.userType} - ${socket.userId}`);
      
      if (socket.userType === 'customer') {
        connectedUsers.delete(socket.userId);
        
        // Notify admins that customer went offline
        io.to('admins').emit('customerOffline', {
          customerId: socket.userId
        });
      } else if (socket.userType === 'admin') {
        connectedAdmins.delete(socket.id);
      }
    });
  });

  return io;
};

// Helper to get io instance
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Helper to check if customer is online
export const isCustomerOnline = (customerId) => {
  return connectedUsers.has(customerId);
};

// Helper to get online customers count
export const getOnlineCustomersCount = () => {
  return connectedUsers.size;
};

export default { initializeSocket, getIO, isCustomerOnline, getOnlineCustomersCount };
