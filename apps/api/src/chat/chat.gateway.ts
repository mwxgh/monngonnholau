import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket, DefaultEventsMap } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service.js';

type AuthSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  { userId: number; role: string }
>;

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  handleConnection(client: AuthSocket) {
    try {
      const token =
        (client.handshake.auth.token as string) ||
        (client.handshake.query.token as string);
      const payload = this.jwtService.verify<{ sub: number; role: string }>(
        token,
        {
          secret: this.config.get<string>('JWT_SECRET'),
        },
      );
      client.data.userId = payload.sub;
      client.data.role = payload.role;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(_client: AuthSocket) {}

  // Customer: join their conversation room and receive history
  @SubscribeMessage('join')
  async handleJoin(@ConnectedSocket() client: AuthSocket) {
    const conversation = await this.chatService.getOrCreateConversation(
      client.data.userId,
    );
    await client.join(`conv:${conversation.id}`);
    const messages = await this.chatService.getMessages(conversation.id);
    client.emit('history', { conversation, messages });
  }

  // Admin/Staff: join a specific conversation room
  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() conversationId: number,
  ) {
    if (client.data.role === 'CUSTOMER') {
      client.emit('error', 'Unauthorized');
      return;
    }
    await client.join(`conv:${conversationId}`);
    const messages = await this.chatService.getMessages(conversationId);
    client.emit('history', { conversationId, messages });
  }

  // Send a message (both customer and staff)
  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() payload: { conversationId: number; content: string },
  ) {
    const message = await this.chatService.createMessage(
      payload.conversationId,
      client.data.userId,
      payload.content,
    );
    this.server.to(`conv:${payload.conversationId}`).emit('message', message);
  }

  // Mark messages as read
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() conversationId: number,
  ) {
    await this.chatService.markRead(conversationId, client.data.userId);
    this.server.to(`conv:${conversationId}`).emit('read', { conversationId });
  }
}
