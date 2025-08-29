import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { Server } from 'http';
import TokenService from './tokenservice';
import ChatService from './chatservice';
import { JWTUser } from '../auth_interface';

interface AuthenticatedWebSocket extends WebSocket {
  user?: JWTUser;
  isAlive?: boolean;
}

interface WebSocketMessage {
  type: 'message' | 'join_conversation' | 'leave_conversation' | 'typing' | 'stop_typing' | 'mark_read';
  data?: any;
}

class WebSocketService {
  private static instance: WebSocketService;
  private wss: WebSocket.Server | null = null;
  private tokenService: TokenService;
  private chatService: ChatService;
  private clients: Map<string, AuthenticatedWebSocket[]> = new Map();
  private conversationRooms: Map<string, Set<string>> = new Map();

  private constructor() {
    this.tokenService = TokenService.getInstance();
    this.chatService = ChatService.getInstance();
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public initialize(server: Server): void {
    this.wss = new WebSocket.Server({
      server,
      path: '/ws',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.setupHeartbeat();

    console.log('WebSocket server initialized');
  }

  private async verifyClient(info: { origin: string; secure: boolean; req: IncomingMessage }): Promise<boolean> {
    try {
      const url = new URL(info.req.url!, `http://${info.req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        console.log('WebSocket connection rejected: No token provided');
        return false;
      }

      const user = await this.tokenService.validateAccessToken(token);
      if (!user) {
        console.log('WebSocket connection rejected: Invalid token');
        return false;
      }

      (info.req as any).user = user;
      return true;
    } catch (error) {
      console.log('WebSocket connection rejected: Token validation failed', error);
      return false;
    }
  }

  private handleConnection(ws: AuthenticatedWebSocket, request: IncomingMessage): void {
    const user = (request as any).user as JWTUser;
    ws.user = user;
    ws.isAlive = true;

    if (!this.clients.has(user.id)) {
      this.clients.set(user.id, []);
    }
    this.clients.get(user.id)!.push(ws);

    console.log(`User ${user.name} (${user.id}) connected to WebSocket`);

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data: WebSocket.Data) => {
      this.handleMessage(ws, data);
    });

    ws.on('close', () => {
      this.handleDisconnection(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.handleDisconnection(ws);
    });
    this.sendToClient(ws, {
      type: 'connected',
      data: { message: 'Connected to chat server', userId: user.id }
    });
  }

  private async handleMessage(ws: AuthenticatedWebSocket, data: WebSocket.Data): Promise<void> {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      const user = ws.user!;

      switch (message.type) {
        case 'join_conversation':
          await this.handleJoinConversation(ws, message.data.conversationId);
          break;

        case 'leave_conversation':
          await this.handleLeaveConversation(ws, message.data.conversationId);
          break;

        case 'message':
          await this.handleSendMessage(ws, message.data);
          break;

        case 'typing':
          await this.handleTyping(ws, message.data.conversationId, true);
          break;

        case 'stop_typing':
          await this.handleTyping(ws, message.data.conversationId, false);
          break;

        case 'mark_read':
          await this.handleMarkRead(ws, message.data.conversationId);
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      this.sendToClient(ws, {
        type: 'error',
        data: { message: 'Failed to process message' }
      });
    }
  }

  private async handleJoinConversation(ws: AuthenticatedWebSocket, conversationId: string): Promise<void> {
    const user = ws.user!;
    
    try {
      const conversation = await this.chatService.getConversation(conversationId, user.id);
      if (!conversation) {
        this.sendToClient(ws, {
          type: 'error',
          data: { message: 'Conversation not found or unauthorized' }
        });
        return;
      }

      if (!this.conversationRooms.has(conversationId)) {
        this.conversationRooms.set(conversationId, new Set());
      }
      this.conversationRooms.get(conversationId)!.add(user.id);

      this.sendToClient(ws, {
        type: 'joined_conversation',
        data: { conversationId, conversation }
      });

      this.broadcastToConversation(conversationId, {
        type: 'user_joined',
        data: { userId: user.id, userName: user.name }
      }, user.id);

    } catch (error) {
      console.error('Error joining conversation:', error);
      this.sendToClient(ws, {
        type: 'error',
        data: { message: 'Failed to join conversation' }
      });
    }
  }

  private async handleLeaveConversation(ws: AuthenticatedWebSocket, conversationId: string): Promise<void> {
    const user = ws.user!;

    if (this.conversationRooms.has(conversationId)) {
      this.conversationRooms.get(conversationId)!.delete(user.id);
      

      if (this.conversationRooms.get(conversationId)!.size === 0) {
        this.conversationRooms.delete(conversationId);
      }
    }

    this.sendToClient(ws, {
      type: 'left_conversation',
      data: { conversationId }
    });

    this.broadcastToConversation(conversationId, {
      type: 'user_left',
      data: { userId: user.id, userName: user.name }
    }, user.id);
  }

  private async handleSendMessage(ws: AuthenticatedWebSocket, data: any): Promise<void> {
    try {
      const { conversationId, content } = data;
      const user = ws.user!;

      const updatedConversation = await this.chatService.sendMessage({
        conversationId,
        senderId: user.id,
        content
      });

      const newMessage = updatedConversation.messages[updatedConversation.messages.length - 1];

      this.broadcastToConversation(conversationId, {
        type: 'new_message',
        data: {
          conversationId,
          message: newMessage,
          conversation: updatedConversation
        }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      this.sendToClient(ws, {
        type: 'error',
        data: { message: 'Failed to send message' }
      });
    }
  }

  private async handleTyping(ws: AuthenticatedWebSocket, conversationId: string, isTyping: boolean): Promise<void> {
    const user = ws.user!;

    this.broadcastToConversation(conversationId, {
      type: isTyping ? 'user_typing' : 'user_stopped_typing',
      data: { userId: user.id, userName: user.name, conversationId }
    }, user.id);
  }

  private async handleMarkRead(ws: AuthenticatedWebSocket, conversationId: string): Promise<void> {
    try {
      const user = ws.user!;
      await this.chatService.markMessagesAsRead(conversationId, user.id);

      this.broadcastToConversation(conversationId, {
        type: 'messages_read',
        data: { userId: user.id, conversationId }
      }, user.id);

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  private handleDisconnection(ws: AuthenticatedWebSocket): void {
    if (!ws.user) return;

    const user = ws.user;
    const userConnections = this.clients.get(user.id);
    
    if (userConnections) {
      const index = userConnections.indexOf(ws);
      if (index > -1) {
        userConnections.splice(index, 1);
      }

      if (userConnections.length === 0) {
        this.clients.delete(user.id);
      }
    }

    this.conversationRooms.forEach((users, conversationId) => {
      if (users.has(user.id)) {
        users.delete(user.id);
        this.broadcastToConversation(conversationId, {
          type: 'user_left',
          data: { userId: user.id, userName: user.name }
        }, user.id);
      }
    });

    console.log(`User ${user.name} (${user.id}) disconnected from WebSocket`);
  }

  private sendToClient(ws: AuthenticatedWebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private broadcastToConversation(conversationId: string, message: any, excludeUserId?: string): void {
    const room = this.conversationRooms.get(conversationId);
    if (!room) return;

    room.forEach(userId => {
      if (userId === excludeUserId) return;

      const userConnections = this.clients.get(userId);
      if (userConnections) {
        userConnections.forEach(ws => {
          this.sendToClient(ws, message);
        });
      }
    });
  }

  public broadcastToUser(userId: string, message: any): void {
    const userConnections = this.clients.get(userId);
    if (userConnections) {
      userConnections.forEach(ws => {
        this.sendToClient(ws, message);
      });
    }
  }

  private setupHeartbeat(): void {
    if (!this.wss) return;

    const interval = setInterval(() => {
      this.wss!.clients.forEach((ws: AuthenticatedWebSocket) => {
        if (ws.isAlive === false) {
          this.handleDisconnection(ws);
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  public getStats() {
    return {
      connectedClients: this.clients.size,
      activeRooms: this.conversationRooms.size,
      totalConnections: Array.from(this.clients.values()).reduce((sum, connections) => sum + connections.length, 0)
    };
  }
}

export default WebSocketService;