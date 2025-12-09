import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GrainType } from '@prisma/client';

const GRAINS_PER_VISIT = 11;

@Injectable()
export class FreeVisitsService {
  constructor(private prisma: PrismaService) {}

  async getTotalGrains(userId: string): Promise<number> {
    const result = await this.prisma.userGrain.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async getUserFreeVisits(userId: string) {
    const freeVisits = await this.prisma.freeVisit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const total = freeVisits.reduce((sum, fv) => sum + fv.amount, 0);
    const used = freeVisits.reduce((sum, fv) => sum + fv.used, 0);
    const available = total - used;

    return {
      total,
      used,
      available,
      visits: freeVisits,
    };
  }

  async purchaseFreeVisits(userId: string, amount: number) {
    if (![1, 5, 10].includes(amount)) {
      throw new BadRequestException('Можно купить только 1, 5 или 10 бесплатных посещений');
    }

    const totalGrains = await this.getTotalGrains(userId);
    const requiredGrains = amount * GRAINS_PER_VISIT;

    if (totalGrains < requiredGrains) {
      throw new BadRequestException(
        `Недостаточно зерен. Доступно: ${totalGrains}, необходимо: ${requiredGrains}`,
      );
    }

    // Списываем зерна
    await this.prisma.userGrain.create({
      data: {
        userId,
        amount: -requiredGrains,
        reason: `Покупка ${amount} бесплатных посещений`,
        type: GrainType.SPENT,
      },
    });

    // Создаем запись о бесплатных посещениях
    const freeVisit = await this.prisma.freeVisit.create({
      data: {
        userId,
        amount,
        used: 0,
      },
    });

    return freeVisit;
  }

  async addFreeVisits(userId: string, amount: number, adminId: string) {
    if (amount <= 0) {
      throw new BadRequestException('Количество должно быть положительным');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const freeVisit = await this.prisma.freeVisit.create({
      data: {
        userId,
        amount,
        used: 0,
      },
    });

    return freeVisit;
  }

  async useFreeVisit(userId: string) {
    const freeVisits = await this.prisma.freeVisit.findMany({
      where: {
        userId,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Находим первую запись с доступными посещениями
    let availableVisit = freeVisits.find((fv) => fv.amount > fv.used);

    if (!availableVisit) {
      throw new BadRequestException('Нет доступных бесплатных посещений');
    }

    // Используем одно посещение
    availableVisit = await this.prisma.freeVisit.update({
      where: { id: availableVisit.id },
      data: {
        used: availableVisit.used + 1,
      },
    });

    return availableVisit;
  }
}
