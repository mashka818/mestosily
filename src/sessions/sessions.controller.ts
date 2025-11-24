import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить расписание занятий' })
  @ApiQuery({ name: 'year', required: false, description: 'Год' })
  @ApiQuery({ name: 'month', required: false, description: 'Месяц (1-12)' })
  @ApiQuery({ name: 'date', required: false, description: 'Конкретная дата (YYYY-MM-DD)' })
  findAll(
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('date') date?: string,
  ) {
    // Если указана конкретная дата - возвращаем расписание на эту дату
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Неверный формат даты. Используйте YYYY-MM-DD');
      }
      return this.sessionsService.findByDate(parsedDate);
    }

    // Иначе возвращаем расписание на месяц
    return this.sessionsService.findAll(
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined,
    );
  }

  @Get('template')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Скачать шаблон для импорта расписания (только администраторы)' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.sessionsService.generateTemplate();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=schedule_template.xlsx');
    res.send(buffer);
  }

  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Импортировать расписание из Excel (только администраторы)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async importSchedule(@UploadedFile() file: Express.Multer.File) {
    return this.sessionsService.importSchedule(file);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить занятие по ID' })
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }
}
