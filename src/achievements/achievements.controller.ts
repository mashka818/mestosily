import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Achievements')
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Создать достижение (только ROOT)' })
  @ApiResponse({ status: 201, description: 'Достижение создано' })
  create(@Body() createAchievementDto: CreateAchievementDto) {
    return this.achievementsService.create(createAchievementDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список достижений' })
  @ApiQuery({ name: 'sectionId', required: false, description: 'Фильтр по секции' })
  @ApiResponse({ status: 200, description: 'Список достижений' })
  findAll(@Query('sectionId') sectionId?: string) {
    return this.achievementsService.findAll(sectionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить достижение по ID' })
  @ApiResponse({ status: 200, description: 'Данные достижения' })
  @ApiResponse({ status: 404, description: 'Достижение не найдено' })
  findOne(@Param('id') id: string) {
    return this.achievementsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Обновить достижение (только ROOT)' })
  @ApiResponse({ status: 200, description: 'Достижение обновлено' })
  update(@Param('id') id: string, @Body() updateAchievementDto: UpdateAchievementDto) {
    return this.achievementsService.update(id, updateAchievementDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Удалить достижение (только ROOT)' })
  @ApiResponse({ status: 200, description: 'Достижение удалено' })
  remove(@Param('id') id: string) {
    return this.achievementsService.remove(id);
  }

  @Post('grant')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ROOT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Выдать достижение пользователю (ADMIN, ROOT)' })
  @ApiResponse({ status: 201, description: 'Достижение выдано, зерна начислены' })
  grantAchievement(
    @Body() body: { achievementId: string; userId: string },
    @Request() req,
  ) {
    return this.achievementsService.grantAchievement(
      body.achievementId,
      body.userId,
      req.user.userId,
    );
  }
}
