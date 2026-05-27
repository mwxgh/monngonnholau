import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateConversation(userId: number) {
    const existing = await this.prisma.conversation.findFirst({
      where: { userId, status: 'OPEN' },
    });
    if (existing) return existing;
    return this.prisma.conversation.create({ data: { userId } });
  }

  async getMessages(conversationId: number) {
    return this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMessage(
    conversationId: number,
    senderId: number,
    content: string,
  ) {
    return this.prisma.message.create({
      data: { conversationId, senderId, content },
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });
  }

  async getConversations() {
    return this.prisma.conversation.findMany({
      include: {
        user: { select: { id: true, name: true, avatar: true, email: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getConversationById(id: number) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }

  async closeConversation(id: number) {
    return this.prisma.conversation.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
  }

  async markRead(conversationId: number, currentUserId: number) {
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        isRead: false,
        senderId: { not: currentUserId },
      },
      data: { isRead: true },
    });
  }
}
