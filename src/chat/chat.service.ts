import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async findUserChats(userId: string) {
    return this.prisma.chat.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        section: true,
        news: true,
        _count: { select: { messages: true } },
      },
    });
  }

  async getMessages(chatId: string) {
    return this.prisma.chatMessage.findMany({
      where: { chatId },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
