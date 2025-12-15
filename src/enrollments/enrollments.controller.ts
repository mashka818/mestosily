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
getMyEnrollments(@CurrentUser() user: any) {
  return this.enrollmentsService.getMyEnrollments(user.userId);
}

@Post()
enroll(@CurrentUser() user: any, @Body() body: { sectionId: string; lessonId?: string }) {
  return this.enrollmentsService.enroll(user.userId, body.sectionId, body.lessonId);
}

@Delete(':id')
cancelEnrollment(@Param('id') id: string, @CurrentUser() user: any) {
  return this.enrollmentsService.cancelEnrollment(id, user.userId);
}
}
