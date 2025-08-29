import Conversation, { IConversation, IMessage } from '../schema/message';
import User from '../schema/user';
import Product from '../schema/product';
import crypto from 'crypto';

export interface CreateConversationPayload {
  buyerId: string;
  sellerId: string;
  productId?: string;
  initialMessage?: string;
}

export interface SendMessagePayload {
  conversationId: string;
  senderId: string;
  content: string;
}

class ChatService {
  private static instance: ChatService;

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  public async createOrGetConversation(payload: CreateConversationPayload): Promise<IConversation> {
    try {
      const { buyerId, sellerId, productId, initialMessage } = payload;

      const [buyer, seller] = await Promise.all([
        User.findById(buyerId),
        User.findById(sellerId)
      ]);

      if (!buyer || !seller) {
        throw new Error('User not found');
      }

      if (buyer.role !== 'buyer') {
        throw new Error('Only buyers can initiate conversations');
      }

      if (seller.role !== 'seller') {
        throw new Error('Can only message sellers');
      }

      if (buyerId === sellerId) {
        throw new Error('Cannot message yourself');
      }

      let conversation = await Conversation.findOne({
        buyerId,
        sellerId,
        ...(productId && { productId })
      });

      if (conversation) {
        return conversation;
      }

      let product = null;
      if (productId) {
        product = await Product.findById(productId);
        if (!product) {
          throw new Error('Product not found');
        }
        if (product.sellerId !== sellerId) {
          throw new Error('Product does not belong to this seller');
        }
      }

      const conversationId = this.generateConversationId();
      const initialMsg = initialMessage || `Hi! I'm interested in ${product?.title || 'your products'}.`;

      const newMessage: IMessage = {
        senderId: buyerId,
        senderName: buyer.name,
        senderRole: 'buyer',
        content: initialMsg,
        timestamp: new Date(),
        read: false
      };

      conversation = new Conversation({
        conversationId,
        buyerId,
        buyerName: buyer.name,
        sellerId,
        sellerName: seller.name,
        ...(product && {
          productId: product._id.toString(),
          productTitle: product.title
        }),
        messages: [newMessage],
        lastMessage: {
          content: initialMsg,
          timestamp: new Date(),
          senderId: buyerId
        },
        unreadCount: {
          buyer: 0,
          seller: 1
        }
      });

      await conversation.save();
      return conversation;

    } catch (error) {
      console.error('Create conversation failed:', error);
      throw error;
    }
  }

  public async sendMessage(payload: SendMessagePayload): Promise<IConversation> {
    try {
      const { conversationId, senderId, content } = payload;

      if (!content.trim()) {
        throw new Error('Message content cannot be empty');
      }

      if (content.length > 1000) {
        throw new Error('Message too long');
      }

      const conversation = await Conversation.findOne({ conversationId });
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      if (senderId !== conversation.buyerId && senderId !== conversation.sellerId) {
        throw new Error('You are not part of this conversation');
      }
      const sender = await User.findById(senderId);
      if (!sender) {
        throw new Error('Sender not found');
      }

      const newMessage: IMessage = {
        senderId,
        senderName: sender.name,
        senderRole: sender.role,
        content: content.trim(),
        timestamp: new Date(),
        read: false
      };
      conversation.messages.push(newMessage);

      conversation.lastMessage = {
        content: content.trim(),
        timestamp: new Date(),
        senderId
      };
      if (sender.role === 'buyer') {
        conversation.unreadCount.seller += 1;
        conversation.unreadCount.buyer = 0;
      } else {
        conversation.unreadCount.buyer += 1;
        conversation.unreadCount.seller = 0;
      }

      await conversation.save();
      return conversation;

    } catch (error) {
      console.error('Send message failed:', error);
      throw error;
    }
  }

  public async getUserConversations(userId: string, page: number = 1, limit: number = 20) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const skip = (page - 1) * limit;
      const query = user.role === 'buyer' 
        ? { buyerId: userId }
        : { sellerId: userId };

      const [conversations, total] = await Promise.all([
        Conversation.find(query)
          .sort({ 'lastMessage.timestamp': -1 })
          .skip(skip)
          .limit(limit),
        Conversation.countDocuments(query)
      ]);

      return {
        conversations,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalConversations: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
          limit
        }
      };

    } catch (error) {
      console.error('Get user conversations failed:', error);
      throw error;
    }
  }

  public async getConversation(conversationId: string, userId: string): Promise<IConversation | null> {
    try {
      const conversation = await Conversation.findOne({ conversationId });
      if (!conversation) {
        return null;
      }
      if (userId !== conversation.buyerId && userId !== conversation.sellerId) {
        throw new Error('Unauthorized');
      }

      return conversation;

    } catch (error) {
      console.error('Get conversation failed:', error);
      throw error;
    }
  }

  public async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const conversation = await Conversation.findOne({ conversationId });
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      if (userId !== conversation.buyerId && userId !== conversation.sellerId) {
        throw new Error('Unauthorized');
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      let hasUnreadMessages = false;
      for (const message of conversation.messages) {
        if (message.senderId !== userId && !message.read) {
          message.read = true;
          hasUnreadMessages = true;
        }
      }
      if (user.role === 'buyer') {
        conversation.unreadCount.buyer = 0;
      } else {
        conversation.unreadCount.seller = 0;
      }

      if (hasUnreadMessages) {
        await conversation.save();
      }

    } catch (error) {
      console.error('Mark messages as read failed:', error);
      throw error;
    }
  }

  public async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    try {
      const conversation = await Conversation.findOne({ conversationId });
      if (!conversation) {
        return false;
      }

      if (userId !== conversation.buyerId && userId !== conversation.sellerId) {
        throw new Error('Unauthorized');
      }

      await Conversation.findOneAndDelete({ conversationId });
      return true;

    } catch (error) {
      console.error('Delete conversation failed:', error);
      throw error;
    }
  }

  public async getUnreadMessagesCount(userId: string): Promise<number> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return 0;
      }

      const query = user.role === 'buyer' 
        ? { buyerId: userId }
        : { sellerId: userId };

      const conversations = await Conversation.find(query);
      
      return conversations.reduce((total, conv) => {
        return total + (user.role === 'buyer' ? conv.unreadCount.buyer : conv.unreadCount.seller);
      }, 0);

    } catch (error) {
      console.error('Get unread messages count failed:', error);
      return 0;
    }
  }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }
}

export default ChatService;