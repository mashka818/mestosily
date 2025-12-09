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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UploadService } from '../upload/upload.service';

@ApiTags('Achievements')
@Controller('achievements')
export class AchievementsController {
  constructor(
    private readonly achievementsService: AchievementsService,
    private readonly uploadService: UploadService,
  ) {}

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
  grantAchievement(@Body() body: { achievementId: string; userId: string }, @Request() req) {
    return this.achievementsService.grantAchievement(
      body.achievementId,
      body.userId,
      req.user.userId,
    );
  }

  @Patch(':id/icon')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Загрузить иконку для достижения (только администраторы)' })
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
  async uploadIcon(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    if (!this.uploadService.validateImage(file)) {
      throw new BadRequestException('Допустимые форматы: JPEG, PNG, GIF, WEBP');
    }

    const iconUrl = this.uploadService.getFileUrl(file.filename);
    return this.achievementsService.update(id, { iconUrl });
  }

  @Post('redeem/code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получить достижение по коду' })
  @ApiResponse({ status: 201, description: 'Достижение получено' })
  redeemByCode(@Request() req, @Body() body: { code: string }) {
    return this.achievementsService.redeemByCode(req.user.id, body.code);
  }

  @Post('redeem/qr')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получить достижение по QR-коду' })
  @ApiResponse({ status: 201, description: 'Достижение получено' })
  redeemByQr(@Request() req, @Body() body: { qrCode: string }) {
    return this.achievementsService.redeemByQr(req.user.id, body.qrCode);
  }
}
