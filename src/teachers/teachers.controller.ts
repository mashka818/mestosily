import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Добавить преподавателя (только ROOT)' })
  @ApiResponse({ status: 201, description: 'Преподаватель создан' })
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список преподавателей' })
  @ApiResponse({ status: 200, description: 'Список преподавателей' })
  findAll() {
    return this.teachersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить преподавателя по ID' })
  @ApiResponse({ status: 200, description: 'Данные преподавателя' })
  @ApiResponse({ status: 404, description: 'Преподаватель не найден' })
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Обновить преподавателя (только ROOT)' })
  @ApiResponse({ status: 200, description: 'Преподаватель обновлен' })
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teachersService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Удалить преподавателя (только ROOT)' })
  @ApiResponse({ status: 200, description: 'Преподаватель удален' })
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }
}
