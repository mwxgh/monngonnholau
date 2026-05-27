import { Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Customer: get or create their conversation
  @Get('conversations/me')
  async getMyConversation(@CurrentUser() user: User) {
    return this.chatService.getOrCreateConversation(user.id);
  }

  // Admin/Staff: list all conversations
  @Get('conversations')
  @Roles(Role.ADMIN, Role.STAFF)
  async getConversations() {
    return this.chatService.getConversations();
  }

  // Get messages for a conversation
  @Get('conversations/:id/messages')
  async getMessages(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.getMessages(id);
  }

  // Admin/Staff: close a conversation
  @Patch('conversations/:id/close')
  @Roles(Role.ADMIN, Role.STAFF)
  async closeConversation(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.closeConversation(id);
  }
}
