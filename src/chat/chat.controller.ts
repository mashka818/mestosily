import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ApiOperation({ summary: 'Получить мои чаты' })
  findUserChats(@Request() req) {
    return this.chatService.findUserChats(req.user.userId);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Получить сообщения чата' })
  getMessages(@Param('id') id: string) {
    return this.chatService.getMessages(id);
  }
}
