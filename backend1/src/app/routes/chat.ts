import { Router, Request, Response } from 'express';
import ChatService from '../services/chatservice';
import AuthMiddleware from '../middleware/auth';
import WebSocketService from '../services/websocketservice';

const chatRouter = Router();
const chatService = ChatService.getInstance();
const authMiddleware = AuthMiddleware.getInstance();
const wsService = WebSocketService.getInstance();

chatRouter.use(authMiddleware.authenticate);

chatRouter.post('/conversations', async (req: Request, res: Response) => {
  try {
    const { sellerId, productId, initialMessage } = req.body;
    const buyerId = req.user!.id;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        error: 'Seller ID is required',
        code: 'MISSING_SELLER_ID'
      });
    }

    if (req.user!.role !== 'buyer') {
      return res.status(403).json({
        success: false,
        error: 'Only buyers can initiate conversations',
        code: 'UNAUTHORIZED_ROLE'
      });
    }

    const conversation = await chatService.createOrGetConversation({
      buyerId,
      sellerId,
      productId,
      initialMessage
    });

    wsService.broadcastToUser(sellerId, {
      type: 'new_conversation',
      data: { conversation }
    });

    res.status(201).json({
      success: true,
      data: { conversation },
      message: 'Conversation created successfully'
    });

  } catch (error: any) {
    console.error('Create conversation error:', error);
    
    if (error.message.includes('not found') || error.message.includes('does not belong')) {
      return res.status(404).json({
        success: false,
        error: error.message,
        code: 'NOT_FOUND'
      });
    }

    if (error.message.includes('Only buyers') || error.message.includes('Cannot message')) {
      return res.status(403).json({
        success: false,
        error: error.message,
        code: 'UNAUTHORIZED'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create conversation',
      code: 'SERVER_ERROR'
    });
  }
});

chatRouter.get('/conversations', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await chatService.getUserConversations(
      userId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Conversations retrieved successfully'
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversations',
      code: 'SERVER_ERROR'
    });
  }
});

chatRouter.get('/conversations/:conversationId', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.id;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required',
        code: 'MISSING_CONVERSATION_ID'
      });
    }

    const conversation = await chatService.getConversation(conversationId, userId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: { conversation },
      message: 'Conversation retrieved successfully'
    });

  } catch (error: any) {
    console.error('Get conversation error:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to view this conversation',
        code: 'UNAUTHORIZED'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation',
      code: 'SERVER_ERROR'
    });
  }
});

chatRouter.post('/conversations/:conversationId/messages', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const senderId = req.user!.id;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required',
        code: 'MISSING_CONVERSATION_ID'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required',
        code: 'MISSING_CONTENT'
      });
    }

    const updatedConversation = await chatService.sendMessage({
      conversationId,
      senderId,
      content: content.trim()
    });

    const newMessage = updatedConversation.messages[updatedConversation.messages.length - 1];
    const otherUserId = senderId === updatedConversation.buyerId 
      ? updatedConversation.sellerId 
      : updatedConversation.buyerId;

    wsService.broadcastToUser(otherUserId, {
      type: 'new_message',
      data: {
        conversationId,
        message: newMessage,
        conversation: updatedConversation
      }
    });

    res.status(201).json({
      success: true,
      data: { 
        message: newMessage,
        conversation: updatedConversation 
      },
      message: 'Message sent successfully'
    });

  } catch (error: any) {
    console.error('Send message error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message,
        code: 'NOT_FOUND'
      });
    }

    if (error.message.includes('not part of') || error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        error: error.message,
        code: 'UNAUTHORIZED'
      });
    }

    if (error.message.includes('empty') || error.message.includes('too long')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: 'INVALID_CONTENT'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      code: 'SERVER_ERROR'
    });
  }
});

chatRouter.patch('/conversations/:conversationId/read', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.id;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required',
        code: 'MISSING_CONVERSATION_ID'
      });
    }

    await chatService.markMessagesAsRead(conversationId, userId);

    const conversation = await chatService.getConversation(conversationId, userId);
    if (conversation) {
      const otherUserId = userId === conversation.buyerId 
        ? conversation.sellerId 
        : conversation.buyerId;

      wsService.broadcastToUser(otherUserId, {
        type: 'messages_read',
        data: { userId, conversationId }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error: any) {
    console.error('Mark as read error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message,
        code: 'NOT_FOUND'
      });
    }

    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to mark messages as read',
      code: 'SERVER_ERROR'
    });
  }
});

chatRouter.delete('/conversations/:conversationId', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.id;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required',
        code: 'MISSING_CONVERSATION_ID'
      });
    }

    const success = await chatService.deleteConversation(conversationId, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete conversation error:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete conversation',
      code: 'SERVER_ERROR'
    });
  }
});

chatRouter.get('/unread-count', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const count = await chatService.getUnreadMessagesCount(userId);

    res.status(200).json({
      success: true,
      data: { count },
      message: 'Unread count retrieved successfully'
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count',
      code: 'SERVER_ERROR'
    });
  }
});
chatRouter.get('/ws-stats', async (req: Request, res: Response) => {
  try {
    const stats = wsService.getStats();
    
    res.status(200).json({
      success: true,
      data: stats,
      message: 'WebSocket stats retrieved successfully'
    });

  } catch (error) {
    console.error('Get WebSocket stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get WebSocket stats',
      code: 'SERVER_ERROR'
    });
  }
});

export default chatRouter;