import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const userGrainsTotal = await this.prisma.userGrain.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const totalGrains = userGrainsTotal._sum.amount || 0;

    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: createOrderDto.items.map((item) => item.productId),
        },
      },
    });

    if (products.length !== createOrderDto.items.length) {
      throw new NotFoundException('Один или несколько товаров не найдены');
    }

    let totalAmount = 0;
    const orderItems = createOrderDto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      };
    });

    if (totalGrains < totalAmount) {
      throw new BadRequestException(
        `Недостаточно зерен. Доступно: ${totalGrains}, необходимо: ${totalAmount}`,
      );
    }

    const order = await this.prisma.order.create({
      data: {
        userId,
        totalAmount,
        status: 'PENDING',
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    await this.prisma.userGrain.create({
      data: {
        userId,
        amount: -totalAmount,
        reason: `Покупка товаров. Заказ #${order.id}`,
        type: 'SPENT',
      },
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'CONFIRMED' },
    });

    const receipt = await this.prisma.receipt.create({
      data: {
        orderId: order.id,
        status: 'PENDING',
      },
    });

    return {
      ...order,
      receipt,
    };
  }

  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: { product: true },
        },
        receipts: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { product: true },
        },
        receipts: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    return order;
  }

  async getReceipt(orderId: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            orderItems: {
              include: {
                product: true,
              },
            },
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        administrator: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!receipt) {
      throw new NotFoundException('Чек не найден');
    }

    return receipt;
  }

  async redeemReceipt(orderId: string, adminId: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { orderId },
    });

    if (!receipt) {
      throw new NotFoundException('Чек не найден');
    }

    if (receipt.status === 'REDEEMED') {
      throw new BadRequestException('Чек уже использован');
    }

    return this.prisma.receipt.update({
      where: { orderId },
      data: {
        status: 'REDEEMED',
        redeemedAt: new Date(),
        redeemedBy: adminId,
      },
      include: {
        order: {
          include: {
            orderItems: {
              include: { product: true },
            },
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });
  }

  async getPendingReceipts() {
    return this.prisma.receipt.findMany({
      where: { status: 'PENDING' },
      include: {
        order: {
          include: {
            orderItems: {
              include: { product: true },
            },
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
