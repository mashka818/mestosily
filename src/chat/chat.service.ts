import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.chat.findMany({
      include: {
        section: true,
        event: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: { select: { messages: true } },
      },
    });
  }
 
 
  async findUserChats(userId: string) {
    return this.prisma.chat.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        section: true,
        event: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: { select: { messages: true } },
      },
    });
  }

  async getMessages(chatId: string, limit = 100, offset = 0) {
    return this.prisma.chatMessage.findMany({
      where: { chatId },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async createMessage(data: { chatId: string; authorId: string; content: string }) {
    const { chatId, authorId, content } = data;

    const message = await this.prisma.chatMessage.create({
      data: {
        chatId,
        authorId,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return message;
  }

  async updateMessage(messageId: string, userId: string, content: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    if (message.authorId !== userId) {
      throw new ForbiddenException('Вы можете редактировать только свои сообщения');
    }

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        content,
        editedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    if (message.authorId !== userId) {
      throw new ForbiddenException('Вы можете удалять только свои сообщения');
    }

    await this.prisma.chatMessage.delete({
      where: { id: messageId },
    });

    return { messageId, chatId: message.chatId };
  }

  async findOne(id: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: {
        section: true,
        event: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: { select: { messages: true } },
      },
    });

    if (!chat) {
      throw new NotFoundException('Чат не найден');
    }

    return chat;
  }

  async createChat(type: 'SUPPORT' | 'SECTION' | 'EVENT', sectionId?: string, eventId?: string) {
    return this.prisma.chat.create({
      data: {
        type,
        sectionId,
        eventId,
      },
      include: {
        section: true,
        event: true,
        participants: true,
      },
    });
  }

  async updateChat(
    id: string,
    data: { type?: 'SUPPORT' | 'SECTION' | 'EVENT'; sectionId?: string; eventId?: string },
  ) {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
    });

    if (!chat) {
      throw new NotFoundException('Чат не найден');
    }

    return this.prisma.chat.update({
      where: { id },
      data,
      include: {
        section: true,
        event: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async addParticipant(chatId: string, userId: string) {
    return this.prisma.chatParticipant.create({
      data: {
        chatId,
        userId,
      },
    });
  }

  async removeParticipant(chatId: string, userId: string) {
    return this.prisma.chatParticipant.delete({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });
  }

  async muteChat(chatId: string, userId: string) {
    return this.prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
      data: {
        isMuted: true,
      },
    });
  }

  async unmuteChat(chatId: string, userId: string) {
    return this.prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
      data: {
        isMuted: false,
      },
    });
  }
}
