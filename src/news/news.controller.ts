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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { AddMediaDto } from './dto/add-media.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Создать новость/событие (только ROOT)' })
  @ApiResponse({ status: 201, description: 'Новость создана' })
  create(@Body() createNewsDto: CreateNewsDto, @Request() req) {
    return this.newsService.create(createNewsDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список новостей' })
  @ApiResponse({ status: 200, description: 'Список новостей' })
  findAll() {
    return this.newsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить новость по ID' })
  @ApiResponse({ status: 200, description: 'Данные новости' })
  @ApiResponse({ status: 404, description: 'Новость не найдена' })
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Обновить новость (только ROOT)' })
  @ApiResponse({ status: 200, description: 'Новость обновлена' })
  update(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Удалить новость (только ROOT)' })
  @ApiResponse({ status: 200, description: 'Новость удалена' })
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }

  @Post(':id/media')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Добавить медиафайл к новости (только ROOT)' })
  @ApiResponse({ status: 201, description: 'Медиафайл добавлен' })
  addMedia(@Param('id') id: string, @Body() addMediaDto: AddMediaDto) {
    return this.newsService.addMedia(id, addMediaDto);
  }

  @Delete('media/:mediaId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Удалить медиафайл (только ROOT)' })
  @ApiResponse({ status: 200, description: 'Медиафайл удален' })
  removeMedia(@Param('mediaId') mediaId: string) {
    return this.newsService.removeMedia(mediaId);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Записаться на событие' })
  @ApiResponse({ status: 201, description: 'Запись на событие создана' })
  registerForEvent(@Param('id') id: string, @Request() req) {
    return this.newsService.registerForEvent(id, req.user.userId);
  }
}
