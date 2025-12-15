// src/chat/chat.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // безопасно пытаемся взять токен из handshake.auth или из Authorization header
      const auth = (client.handshake.auth as any) ?? {};
      let token: string | undefined = auth?.token;

      if (!token) {
        const header = (client.handshake.headers?.authorization as string | undefined) ?? '';
        if (header && header.startsWith('Bearer ')) {
          token = header.split(' ')[1];
        }
      }

      if (!token) {
        // нет токена — закрываем соединение
        client.disconnect(true);
        return;
      }

      // verify token
      const payload: any = this.jwtService.verify(token);

      // payload might have sub, id or userId depending on how token was generated
      const uid = payload?.sub ?? payload?.userId ?? payload?.id;
      if (!uid) {
        client.disconnect(true);
        return;
      }

      (client as AuthenticatedSocket).userId = String(uid);

      console.log(`Client connected: ${client.id}, User: ${(client as AuthenticatedSocket).userId}`);
    } catch (error: any) {
      console.error('Authentication error:', error?.message ?? error);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    try {
      const { chatId } = data;
      const authClient = client as AuthenticatedSocket;

      if (!authClient.userId) {
        return { error: 'Не авторизован' };
      }

      // Присоединяем клиента к комнате чата
      client.join(`chat:${chatId}`);

      // Получаем историю сообщений (через сервис)
      const messages = await this.chatService.getMessages(chatId);

      return {
        success: true,
        messages,
      };
    } catch (error: any) {
      return { error: error?.message ?? 'Ошибка при joinChat' };
    }
  }

  @SubscribeMessage('leaveChat')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const { chatId } = data;
    client.leave(`chat:${chatId}`);
    return { success: true };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; content: string },
  ) {
    try {
      const { chatId, content } = data;
      const authClient = client as AuthenticatedSocket;

      if (!authClient.userId) {
        return { error: 'Не авторизован' };
      }

      // Создаём сообщение — ВАЖНО: передаём один объект с полями
      const message = await this.chatService.createMessage({
        chatId,
        authorId: authClient.userId,
        content,
      });

      // Отправляем сообщение всем участникам чата (два аргумента: событие + payload)
      this.server.to(`chat:${chatId}`).emit('newMessage', message);

      return {
        success: true,
        message,
      };
    } catch (error: any) {
      return { error: error?.message ?? 'Ошибка при отправке сообщения' };
    }
  }

  @SubscribeMessage('editMessage')
  async handleEditMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; content: string },
  ) {
    try {
      const { messageId, content } = data;
      const authClient = client as AuthenticatedSocket;

      if (!authClient.userId) {
        return { error: 'Не авторизован' };
      }

      // Обновляем сообщение
      const message = await this.chatService.updateMessage(messageId, authClient.userId, content);

      // Отправляем обновлённое сообщение всем участникам чата
      this.server.to(`chat:${message.chatId}`).emit('messageEdited', message);

      return {
        success: true,
        message,
      };
    } catch (error: any) {
      return { error: error?.message ?? 'Ошибка при редактировании сообщения' };
    }
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    try {
      const { messageId } = data;
      const authClient = client as AuthenticatedSocket;

      if (!authClient.userId) {
        return { error: 'Не авторизован' };
      }

      // Удаляем сообщение
      const result = await this.chatService.deleteMessage(messageId, authClient.userId);

      // Уведомляем участников чата об удалении
      this.server.to(`chat:${result.chatId}`).emit('messageDeleted', { messageId });

      return {
        success: true,
      };
    } catch (error: any) {
      return { error: error?.message ?? 'Ошибка при удалении сообщения' };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; isTyping: boolean },
  ) {
    try {
      const { chatId, isTyping } = data;
      const authClient = client as AuthenticatedSocket;

      // Отправляем событие typing другим участникам чата (кроме отправителя)
      client.to(`chat:${chatId}`).emit('userTyping', {
        userId: authClient.userId,
        isTyping,
      });

      return { success: true };
    } catch (error: any) {
      return { error: error?.message ?? 'Ошибка typing' };
    }
  }
}
