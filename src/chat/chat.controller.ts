import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  Request,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ChatType } from '@prisma/client';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/all')
  @ApiOperation({ summary: 'Получить все чаты' })
  @ApiResponse({ status: 200, description: 'Список чатов пользователя' })
  findAll(@Request() req) {
    return this.chatService.findAll();
  }

    @Get()
  @ApiOperation({ summary: 'Получить мои чаты' })
  @ApiResponse({ status: 200, description: 'Список чатов пользователя' })
  findUserChats(@Request() req) {
    return this.chatService.findUserChats(req.user.id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Получить сообщения чата' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Список сообщений' })
  getMessages(
    @Param('id') chatId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.chatService.getMessages(
      chatId,
      limit ? parseInt(limit) : 100,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить чат по ID' })
  @ApiResponse({ status: 200, description: 'Информация о чате' })
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Создать чат (только администраторы)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { enum: ['SUPPORT', 'SECTION', 'EVENT'] },
        sectionId: { type: 'string', nullable: true },
        eventId: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Чат создан' })
  createChat(@Body() body: { type: ChatType; sectionId?: string; eventId?: string }) {
    return this.chatService.createChat(body.type, body.sectionId, body.eventId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Обновить чат (только администраторы)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { enum: ['SUPPORT', 'SECTION', 'EVENT'], nullable: true },
        sectionId: { type: 'string', nullable: true },
        eventId: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Чат обновлен' })
  updateChat(
    @Param('id') id: string,
    @Body() body: { type?: ChatType; sectionId?: string; eventId?: string },
  ) {
    return this.chatService.updateChat(id, body);
  }

  @Post(':id/participants')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Добавить участника в чат (только администраторы)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Участник добавлен' })
  addParticipant(@Param('id') chatId: string, @Body() body: { userId: string }) {
    return this.chatService.addParticipant(chatId, body.userId);
  }

  @Delete(':id/participants/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Удалить участника из чата (только администраторы)' })
  @ApiResponse({ status: 200, description: 'Участник удален' })
  removeParticipant(@Param('id') chatId: string, @Param('userId') userId: string) {
    return this.chatService.removeParticipant(chatId, userId);
  }

  @Patch(':id/mute')
  @ApiOperation({ summary: 'Отключить уведомления чата' })
  @ApiResponse({ status: 200, description: 'Уведомления отключены' })
  muteChat(@Param('id') chatId: string, @Request() req) {
    return this.chatService.muteChat(chatId, req.user.id);
  }

  @Patch(':id/unmute')
  @ApiOperation({ summary: 'Включить уведомления чата' })
  @ApiResponse({ status: 200, description: 'Уведомления включены' })
  unmuteChat(@Param('id') chatId: string, @Request() req) {
    return this.chatService.unmuteChat(chatId, req.user.id);
  }
}
