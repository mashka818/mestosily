import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('my')
  @ApiOperation({ summary: 'Получить мои записи на уроки' })
  @ApiResponse({ status: 200, description: 'Список записей пользователя' })
  getMyEnrollments(@CurrentUser() user: any) {
    return this.enrollmentsService.getMyEnrollments(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Записаться на секцию/урок' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['sectionId'],
      properties: {
        sectionId: { type: 'string', example: 'section-id' },
        lessonId: { type: 'string', example: 'lesson-id', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Запись создана' })
  enroll(@CurrentUser() user: any, @Body() body: { sectionId: string; lessonId?: string }) {
    return this.enrollmentsService.enroll(user.id, body.sectionId, body.lessonId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Отменить запись' })
  @ApiResponse({ status: 200, description: 'Запись отменена' })
  cancelEnrollment(@Param('id') id: string, @CurrentUser() user: any) {
    return this.enrollmentsService.cancelEnrollment(id, user.id);
  }
}
