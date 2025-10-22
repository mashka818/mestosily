import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Получить расписание занятий и ивентов',
    description: 'Возвращает предстоящие занятия (sessions) и ивенты (events) из новостей'
  })
  findAll() {
    return this.sessionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить занятие по ID' })
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }
}

