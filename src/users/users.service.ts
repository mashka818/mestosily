import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const totalGrains = await this.prisma.userGrain.aggregate({
      where: { userId: id },
      _sum: { amount: true },
    });

    const achievements = await this.prisma.userAchievement.findMany({
      where: { userId: id },
      include: {
        achievement: true,
      },
    });

    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId: id },
      include: {
        section: true,
        lesson: {
          include: {
            teacher: true,
          },
        },
      },
    });

    return {
      ...user,
      totalGrains: totalGrains._sum.amount || 0,
      achievements,
      enrollments,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        dateOfBirth: updateUserDto.dateOfBirth ? new Date(updateUserDto.dateOfBirth) : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Пользователь удален' };
  }

  async getUserProfile(id: string) {
    const user = await this.findOne(id);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayLessons = await this.prisma.lesson.findMany({
      where: {
        enrollments: {
          some: {
            userId: id,
          },
        },
      },
      include: {
        section: true,
        teacher: true,
      },
      orderBy: {
        startsAt: 'asc',
      },
    });

    return {
      ...user,
      todayLessons,
    };
  }

  async createAdmin(createAdminDto: CreateAdminDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createAdminDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

    const admin = await this.prisma.user.create({
      data: {
        email: createAdminDto.email,
        password: hashedPassword,
        firstName: createAdminDto.firstName,
        lastName: createAdminDto.lastName,
        phone: createAdminDto.phone,
        role: UserRole.ADMIN,
        dateOfBirth: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return admin;
  }

  async removeAdmin(adminId: string, requesterId: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Администратор не найден');
    }

    if (admin.role === UserRole.ROOT) {
      throw new ForbiddenException('Нельзя удалить ROOT администратора');
    }

    if (admin.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Пользователь не является администратором');
    }

    if (adminId === requesterId) {
      throw new ForbiddenException('Нельзя удалить самого себя');
    }

    await this.prisma.user.delete({
      where: { id: adminId },
    });

    return { message: 'Администратор удален' };
  }

  async getAllAdmins() {
    return this.prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.ADMIN, UserRole.ROOT],
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
