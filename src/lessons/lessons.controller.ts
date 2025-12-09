import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
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
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Lessons')
@Controller('lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Создать урок (только для администраторов)' })
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.create(createLessonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех уроков' })
  @ApiQuery({ name: 'sectionId', required: false, description: 'Фильтр по секции' })
  findAll(@Query('sectionId') sectionId?: string) {
    return this.lessonsService.findAll(sectionId);
  }

  @Get('template')
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Скачать шаблон Excel для импорта расписания' })
  async getTemplate(@Res() res: Response) {
    const buffer = await this.lessonsService.getExcelTemplate();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=schedule_template.xlsx');
    res.send(buffer);
  }

  @Post('import/:sectionId')
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Импортировать расписание из Excel (только для администраторов)' })
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
  async importSchedule(
    @Param('sectionId') sectionId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    return this.lessonsService.importFromExcel(file, sectionId);
  }

  @Get('schedule/:sectionId')
  @ApiOperation({ summary: 'Получить расписание для секции' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Дата начала периода (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Дата окончания периода (YYYY-MM-DD)' })
  getSchedule(
    @Param('sectionId') sectionId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.lessonsService.getScheduleForSection(sectionId, startDate, endDate);
  }

  @Get('by-date')
  @ApiOperation({ summary: 'Получить занятия по дате' })
  @ApiQuery({ name: 'date', required: true, description: 'Дата для поиска занятий (YYYY-MM-DD)' })
  @ApiQuery({ name: 'sectionId', required: false, description: 'Фильтр по секции (опционально)' })
  findByDate(
    @Query('date') date: string,
    @Query('sectionId') sectionId?: string,
  ) {
    return this.lessonsService.findByDate(date, sectionId);
  }

  @Get('by-date-range')
  @ApiOperation({ summary: 'Получить занятия по диапазону дат' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Дата начала периода (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'Дата окончания периода (YYYY-MM-DD)' })
  @ApiQuery({ name: 'sectionId', required: false, description: 'Фильтр по секции (опционально)' })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('sectionId') sectionId?: string,
  ) {
    return this.lessonsService.findByDateRange(startDate, endDate, sectionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить урок по ID' })
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Обновить урок (только для администраторов)' })
  update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Удалить урок (только для администраторов)' })
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(id);
  }
}
