import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UploadService } from '../upload/upload.service';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Создать новость (только для администраторов)' })
  create(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(createNewsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список новостей' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество на странице' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.newsService.findAll(
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
    );
  }

  @Get('recent')
  @ApiOperation({ summary: 'Получить последние новости' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество новостей' })
  findRecent(@Query('limit') limit?: string) {
    return this.newsService.findRecent(limit ? parseInt(limit) : 5);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить новость по ID' })
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Обновить новость (только для администраторов)' })
  update(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Удалить новость (только для администраторов)' })
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }

  @Patch(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Загрузить изображение для новости (только администраторы)' })
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
  async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    if (!this.uploadService.validateImage(file)) {
      throw new BadRequestException('Допустимые форматы: JPEG, PNG, GIF, WEBP');
    }

    const imageUrl = this.uploadService.getFileUrl(file.filename);
    return this.newsService.update(id, { imageUrl });
  }
}
