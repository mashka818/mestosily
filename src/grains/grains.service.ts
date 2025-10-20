import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GrainType } from '@prisma/client';

@Injectable()
export class GrainsService {
  constructor(private prisma: PrismaService) {}

  async addGrains(userId: string, amount: number, reason: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (amount <= 0) {
      throw new BadRequestException('Количество зерен должно быть положительным');
    }

    return this.prisma.userGrain.create({
      data: {
        userId,
        amount,
        reason: reason || `Начислено администратором`,
        type: GrainType.BONUS,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async deductGrains(userId: string, amount: number, reason: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (amount <= 0) {
      throw new BadRequestException('Количество зерен должно быть положительным');
    }

    const totalGrains = await this.getTotalGrains(userId);
    if (totalGrains < amount) {
      throw new BadRequestException('Недостаточно зерен для списания');
    }

    return this.prisma.userGrain.create({
      data: {
        userId,
        amount: -amount,
        reason: reason || `Списано администратором`,
        type: GrainType.SPENT,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async getHistory(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const history = await this.prisma.userGrain.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.getTotalGrains(userId);

    return {
      userId,
      total,
      history,
    };
  }

  async getTotalGrains(userId: string): Promise<number> {
    const result = await this.prisma.userGrain.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    return result._sum.amount || 0;
  }
}

