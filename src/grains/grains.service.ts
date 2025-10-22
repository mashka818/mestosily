import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GrainType } from '@prisma/client';

@Injectable()
export class GrainsService {
  constructor(private prisma: PrismaService) {}

  async addGrains(userId: string, amount: number, reason: string, _adminId: string) {
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

  async deductGrains(userId: string, amount: number, reason: string, _adminId: string) {
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

  async transferGrains(
    fromUserId: string,
    toUserId: string | undefined,
    toUserEmail: string | undefined,
    amount: number,
    message?: string,
  ) {
    if (!toUserId && !toUserEmail) {
      throw new BadRequestException('Укажите ID или email получателя');
    }

    if (toUserId && toUserEmail) {
      throw new BadRequestException('Укажите либо ID, либо email получателя, не оба');
    }

    const fromUser = await this.prisma.user.findUnique({
      where: { id: fromUserId },
    });
    if (!fromUser) {
      throw new NotFoundException('Отправитель не найден');
    }

    const toUser = await this.prisma.user.findUnique({
      where: toUserId ? { id: toUserId } : { email: toUserEmail },
    });
    if (!toUser) {
      throw new NotFoundException('Получатель не найден');
    }

    if (fromUser.id === toUser.id) {
      throw new BadRequestException('Нельзя переводить зерна самому себе');
    }

    if (amount <= 0) {
      throw new BadRequestException('Количество зерен должно быть положительным');
    }

    const fromUserGrains = await this.getTotalGrains(fromUserId);
    if (fromUserGrains < amount) {
      throw new BadRequestException('Недостаточно зерен для перевода');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.userGrain.create({
        data: {
          userId: fromUserId,
          amount: -amount,
          reason: `Перевод пользователю ${toUser.firstName} ${toUser.lastName}${message ? `: ${message}` : ''}`,
          type: GrainType.SPENT,
        },
      });

      await tx.userGrain.create({
        data: {
          userId: toUser.id,
          amount: amount,
          reason: `Перевод от ${fromUser.firstName} ${fromUser.lastName}${message ? `: ${message}` : ''}`,
          type: GrainType.BONUS,
        },
      });

      const transfer = await tx.grainTransfer.create({
        data: {
          fromUserId: fromUserId,
          toUserId: toUser.id,
          amount,
          message,
        },
        include: {
          fromUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          toUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return transfer;
    });
  }

  async getTransferHistory(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const sent = await this.prisma.grainTransfer.findMany({
      where: { fromUserId: userId },
      include: {
        toUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const received = await this.prisma.grainTransfer.findMany({
      where: { toUserId: userId },
      include: {
        fromUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      sent,
      received,
    };
  }
}
