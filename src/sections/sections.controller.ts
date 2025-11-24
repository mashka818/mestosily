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
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { EnrollDto } from './dto/enroll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UploadService } from '../upload/upload.service';

@ApiTags('Sections')
@Controller('sections')
export class SectionsController {
  constructor(
    private readonly sectionsService: SectionsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Создать секцию (только ROOT)' })
  @ApiResponse({ status: 201, description: 'Секция создана' })
  create(@Body() createSectionDto: CreateSectionDto) {
    return this.sectionsService.create(createSectionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех активных секций' })
  @ApiResponse({ status: 200, description: 'Список секций' })
  findAll() {
    return this.sectionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить секцию по ID' })
  @ApiResponse({ status: 200, description: 'Данные секции' })
  @ApiResponse({ status: 404, description: 'Секция не найдена' })
  findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Обновить секцию (только ROOT)' })
  @ApiResponse({ status: 200, description: 'Секция обновлена' })
  update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionsService.update(id, updateSectionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Удалить секцию (только ROOT)' })
  @ApiResponse({ status: 200, description: 'Секция удалена' })
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(id);
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Записаться на секцию' })
  @ApiResponse({ status: 201, description: 'Запись создана' })
  @ApiResponse({ status: 404, description: 'Секция не найдена' })
  enroll(@Param('id') id: string, @Request() req, @Body() enrollDto: EnrollDto) {
    return this.sectionsService.enroll(id, req.user.userId, enrollDto.sessionId);
  }

  @Patch(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Загрузить изображение для секции (только администраторы)' })
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
    return this.sectionsService.update(id, { imageUrl });
  }

  @Patch(':id/icon')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Загрузить иконку для секции (только администраторы)' })
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
    return this.sectionsService.update(id, { iconUrl });
  }

  @Get(':id/images')
  @ApiOperation({ summary: 'Получить изображения секции' })
  @ApiResponse({ status: 200, description: 'Список изображений секции' })
  getSectionImages(@Param('id') id: string) {
    return this.sectionsService.getSectionImages(id);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Добавить изображение в галерею секции (только администраторы)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        position: {
          type: 'number',
          description: 'Позиция изображения',
        },
      },
    },
  })
  async addSectionImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { position?: string },
  ) {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    if (!this.uploadService.validateImage(file)) {
      throw new BadRequestException('Допустимые форматы: JPEG, PNG, GIF, WEBP');
    }

    const imageUrl = this.uploadService.getFileUrl(file.filename);
    const position = body.position ? parseInt(body.position, 10) : 0;
    return this.sectionsService.addSectionImage(id, imageUrl, position);
  }

  @Patch('images/:imageId/position')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Изменить позицию изображения (только администраторы)' })
  updateImagePosition(@Param('imageId') imageId: string, @Body() body: { position: number }) {
    return this.sectionsService.updateSectionImagePosition(imageId, body.position);
  }

  @Delete('images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Удалить изображение из галереи (только администраторы)' })
  deleteSectionImage(@Param('imageId') imageId: string) {
    return this.sectionsService.deleteSectionImage(imageId);
  }
}
