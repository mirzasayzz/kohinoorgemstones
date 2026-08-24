import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  // Conversation between customer and admin
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  // Message content
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxLength: [1000, 'Message cannot exceed 1000 characters']
  },
  // Who sent: 'customer' or 'admin'
  sender: {
    type: String,
    enum: ['customer', 'admin'],
    required: true
  },
  // Admin user who replied (if sender is admin)
  adminUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Read status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  // Attachment (optional - for future)
  attachment: {
    url: String,
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ customer: 1, createdAt: -1 });
messageSchema.index({ isRead: 1, sender: 1 });

// Static method to get unread count for admin
messageSchema.statics.getUnreadCountForAdmin = async function() {
  return await this.countDocuments({ sender: 'customer', isRead: false });
};

// Static method to get conversation with a customer
messageSchema.statics.getConversation = async function(customerId, limit = 50) {
  return await this.find({ customer: customerId })
    .sort({ createdAt: 1 })
    .limit(limit)
    .populate('customer', 'name username avatar')
    .populate('adminUser', 'name');
};

// Static method to get all conversations (grouped by customer)
messageSchema.statics.getAllConversations = async function() {
  return await this.aggregate([
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$customer',
        lastMessage: { $first: '$content' },
        lastMessageTime: { $first: '$createdAt' },
        lastSender: { $first: '$sender' },
        unreadCount: {
          $sum: {
            $cond: [{ $and: [{ $eq: ['$sender', 'customer'] }, { $eq: ['$isRead', false] }] }, 1, 0]
          }
        },
        totalMessages: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'customers',
        localField: '_id',
        foreignField: '_id',
        as: 'customerInfo'
      }
    },
    {
      $unwind: '$customerInfo'
    },
    {
      $project: {
        customer: {
          _id: '$customerInfo._id',
          name: '$customerInfo.name',
          username: '$customerInfo.username',
          email: '$customerInfo.email',
          avatar: '$customerInfo.avatar',
          phone: '$customerInfo.phone'
        },
        lastMessage: 1,
        lastMessageTime: 1,
        lastSender: 1,
        unreadCount: 1,
        totalMessages: 1
      }
    },
    {
      $sort: { lastMessageTime: -1 }
    }
  ]);
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
