import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NewsType } from '@prisma/client';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const sessions = await this.prisma.session.findMany({
      where: {
        startsAt: { gte: new Date() },
      },
      include: {
        section: true,
        teacher: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { startsAt: 'asc' },
    });

    const events = await this.prisma.news.findMany({
      where: {
        type: NewsType.EVENT,
        isActive: true,
        publishedAt: { gte: new Date() },
      },
      select: {
        id: true,
        title: true,
        content: true,
        imageUrl: true,
        publishedAt: true,
        _count: { select: { eventRegistrations: true } },
      },
      orderBy: { publishedAt: 'asc' },
    });

    return {
      sessions,
      events,
    };
  }

  async findOne(id: string) {
    return this.prisma.session.findUnique({
      where: { id },
      include: {
        section: true,
        teacher: true,
        enrollments: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });
  }
}

