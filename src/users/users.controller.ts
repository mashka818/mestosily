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
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Получить список всех пользователей (только для администраторов)' })
  @ApiResponse({ status: 200, description: 'Список пользователей' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Профиль пользователя с расписанием на сегодня' })
  getMyProfile(@Request() req) {
    return this.usersService.getUserProfile(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiResponse({ status: 200, description: 'Данные пользователя' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить данные пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь обновлен' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiOperation({ summary: 'Удалить пользователя (только ROOT)' })
  @ApiResponse({ status: 200, description: 'Пользователь удален' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('admins/list')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiOperation({ summary: 'Получить список всех администраторов (только ROOT)' })
  @ApiResponse({ status: 200, description: 'Список администраторов' })
  getAllAdmins() {
    return this.usersService.getAllAdmins();
  }

  @Post('admins/create')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiOperation({ summary: 'Создать нового администратора (только ROOT)' })
  @ApiResponse({ status: 201, description: 'Администратор создан' })
  @ApiResponse({ status: 409, description: 'Пользователь с таким email уже существует' })
  createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.usersService.createAdmin(createAdminDto);
  }

  @Delete('admins/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ROOT)
  @ApiOperation({ summary: 'Удалить администратора (только ROOT)' })
  @ApiResponse({ status: 200, description: 'Администратор удален' })
  @ApiResponse({ status: 404, description: 'Администратор не найден' })
  @ApiResponse({ status: 403, description: 'Нельзя удалить ROOT администратора или самого себя' })
  removeAdmin(@Param('id') id: string, @Request() req) {
    return this.usersService.removeAdmin(id, req.user.userId);
  }
}
