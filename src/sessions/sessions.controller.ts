import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { SessionsService } from './sessions.service';
import { ImportScheduleDto } from './dto/import-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить расписание занятий и ивентов за месяц',
    description:
      'Возвращает занятия и ивенты за указанный месяц. Если месяц не указан - за текущий месяц',
  })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Год (например, 2025)' })
  @ApiQuery({ name: 'month', required: false, type: Number, description: 'Месяц (1-12)' })
  findAll(@Query('year') year?: string, @Query('month') month?: string) {
    const yearNum = year ? parseInt(year, 10) : undefined;
    const monthNum = month ? parseInt(month, 10) : undefined;
    return this.sessionsService.findAll(yearNum, monthNum);
  }

  @Get('template/download')
  @ApiOperation({ summary: 'Скачать шаблон Excel для импорта расписания' })
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
  @Roles(UserRole.ROOT)
  @ApiOperation({ summary: 'Импортировать расписание из Excel (ROOT)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImportScheduleDto })
  @UseInterceptors(FileInterceptor('file'))
  importSchedule(@UploadedFile() file: Express.Multer.File) {
    return this.sessionsService.importSchedule(file);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить занятие по ID' })
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }
}
