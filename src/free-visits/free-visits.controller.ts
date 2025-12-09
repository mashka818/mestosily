import { Controller, Get, Post, UseGuards, Request, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FreeVisitsService } from './free-visits.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PurchaseFreeVisitsDto } from './dto/purchase-free-visits.dto';
import { CreateFreeVisitDto } from './dto/create-free-visit.dto';

@ApiTags('Free Visits')
@Controller('free-visits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class FreeVisitsController {
  constructor(private readonly freeVisitsService: FreeVisitsService) {}

  @Get('my')
  @ApiOperation({ summary: 'Получить мои бесплатные посещения' })
  @ApiResponse({ status: 200, description: 'Информация о бесплатных посещениях' })
  getMyFreeVisits(@Request() req) {
    return this.freeVisitsService.getUserFreeVisits(req.user.id);
  }

  @Post('purchase')
  @ApiOperation({ summary: 'Купить бесплатные посещения за зерна' })
  @ApiResponse({ status: 201, description: 'Бесплатные посещения куплены' })
  purchaseFreeVisits(@Request() req, @Body() dto: PurchaseFreeVisitsDto) {
    return this.freeVisitsService.purchaseFreeVisits(req.user.id, dto.amount);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Добавить бесплатные посещения пользователю (только администраторы)' })
  @ApiResponse({ status: 201, description: 'Бесплатные посещения добавлены' })
  addFreeVisits(@Body() dto: CreateFreeVisitDto, @Request() req) {
    return this.freeVisitsService.addFreeVisits(dto.userId, dto.amount, req.user.id);
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Получить бесплатные посещения пользователя (только администраторы)' })
  @ApiResponse({ status: 200, description: 'Информация о бесплатных посещениях' })
  getUserFreeVisits(@Param('userId') userId: string) {
    return this.freeVisitsService.getUserFreeVisits(userId);
  }
}
