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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { UploadService } from '../upload/upload.service';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Создать событие (только для администраторов)' })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех событий' })
  findAll() {
    return this.eventsService.findAll();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Получить предстоящие события' })
  findUpcoming() {
    return this.eventsService.findUpcoming();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить событие по ID' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Обновить событие (только для администраторов)' })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Удалить событие (только для администраторов)' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Patch(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Загрузить изображение для события (только администраторы)' })
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
    return this.eventsService.update(id, { imageUrl });
  }

  @Patch(':id/banner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Загрузить баннер для события (только администраторы)' })
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
  async uploadBanner(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    if (!this.uploadService.validateImage(file)) {
      throw new BadRequestException('Допустимые форматы: JPEG, PNG, GIF, WEBP');
    }

    const bannerUrl = this.uploadService.getFileUrl(file.filename);
    return this.eventsService.update(id, { bannerUrl });
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Зарегистрироваться на мероприятие' })
  registerForEvent(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.registerForEvent(user.id, id);
  }

  @Delete(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Отменить регистрацию на мероприятие' })
  cancelRegistration(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.cancelRegistration(user.id, id);
  }

  @Get('my/registrations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получить мои регистрации на мероприятия' })
  getMyRegistrations(@CurrentUser() user: any) {
    return this.eventsService.getMyRegistrations(user.id);
  }
}
