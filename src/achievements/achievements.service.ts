import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  async create(createAchievementDto: CreateAchievementDto) {
    if (createAchievementDto.sectionId) {
      const section = await this.prisma.section.findUnique({
        where: { id: createAchievementDto.sectionId },
      });

      if (!section) {
        throw new BadRequestException('Указанная секция не найдена');
      }
    }

    return this.prisma.achievement.create({
      data: createAchievementDto,
      include: {
        section: true,
      },
    });
  }

  async findAll(sectionId?: string) {
    return this.prisma.achievement.findMany({
      where: {
        isActive: true,
        sectionId: sectionId || undefined,
      },
      include: {
        section: true,
        _count: { select: { userAchievements: true } },
      },
    });
  }

  async findOne(id: string) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { id },
      include: {
        section: true,
        userAchievements: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!achievement) {
      throw new NotFoundException('Достижение не найдено');
    }

    return achievement;
  }

  async update(id: string, updateAchievementDto: UpdateAchievementDto) {
    const achievement = await this.findOne(id);

    return this.prisma.achievement.update({
      where: { id },
      data: updateAchievementDto,
      include: {
        section: true,
      },
    });
  }

  async remove(id: string) {
    const achievement = await this.findOne(id);

    await this.prisma.achievement.delete({
      where: { id },
    });

    return { message: 'Достижение удалено' };
  }

  async grantAchievement(achievementId: string, userId: string, adminId: string) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      throw new NotFoundException('Достижение не найдено');
    }

    const existing = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
    });

    if (existing) {
      throw new Error('Пользователь уже имеет это достижение');
    }

    const userAchievement = await this.prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
      },
      include: {
        achievement: true,
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (achievement.rewardGrains > 0) {
      await this.prisma.userGrain.create({
        data: {
          userId,
          amount: achievement.rewardGrains,
          reason: `За достижение: ${achievement.name}`,
          type: 'ACHIEVEMENT',
        },
      });
    }

    return userAchievement;
  }

  async redeemByCode(userId: string, code: string) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { code },
    });

    if (!achievement) {
      throw new NotFoundException('Достижение с таким кодом не найдено');
    }

    if (!achievement.isActive) {
      throw new BadRequestException('Достижение неактивно');
    }

    const existing = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Вы уже получили это достижение');
    }

    return this.grantAchievement(achievement.id, userId, 'system');
  }

  async redeemByQr(userId: string, qrCode: string) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { qrCode },
    });

    if (!achievement) {
      throw new NotFoundException('Достижение с таким QR-кодом не найдено');
    }

    if (!achievement.isActive) {
      throw new BadRequestException('Достижение неактивно');
    }

    const existing = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Вы уже получили это достижение');
    }

    return this.grantAchievement(achievement.id, userId, 'system');
  }
}
