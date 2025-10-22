import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  async create(createSectionDto: CreateSectionDto) {
    return this.prisma.section.create({
      data: createSectionDto,
    });
  }

  async findAll() {
    return this.prisma.section.findMany({
      where: { isActive: true },
      include: {
        teachers: true,
        sessions: {
          where: {
            startsAt: {
              gte: new Date(),
            },
          },
          orderBy: {
            startsAt: 'asc',
          },
          take: 5,
          include: {
            teacher: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        teachers: true,
        sessions: {
          where: {
            startsAt: {
              gte: new Date(),
            },
          },
          orderBy: {
            startsAt: 'asc',
          },
          include: {
            teacher: true,
            enrollments: {
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
            },
          },
        },
        achievements: true,
        enrollments: {
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
        },
      },
    });

    if (!section) {
      throw new NotFoundException('Секция не найдена');
    }

    return section;
  }

  async update(id: string, updateSectionDto: UpdateSectionDto) {
    const section = await this.prisma.section.findUnique({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException('Секция не найдена');
    }

    return this.prisma.section.update({
      where: { id },
      data: updateSectionDto,
    });
  }

  async remove(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException('Секция не найдена');
    }

    await this.prisma.section.delete({
      where: { id },
    });

    return { message: 'Секция удалена' };
  }

  async enroll(sectionId: string, userId: string, sessionId?: string) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        sessions: {
          where: sessionId ? { id: sessionId } : undefined,
        },
      },
    });

    if (!section) {
      throw new NotFoundException('Секция не найдена');
    }

    if (sessionId) {
      const session = section.sessions.find((s) => s.id === sessionId);
      if (!session) {
        throw new NotFoundException('Занятие не найдено');
      }

      const enrollmentsCount = await this.prisma.enrollment.count({
        where: { sessionId },
      });

      if (session.capacity && enrollmentsCount >= session.capacity) {
        throw new Error('Мест на занятие не осталось');
      }
    }

    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        sectionId,
        sessionId: sessionId || null,
      },
    });

    if (existingEnrollment) {
      throw new Error('Вы уже записаны на эту секцию');
    }

    return this.prisma.enrollment.create({
      data: {
        userId,
        sectionId,
        sessionId,
        status: 'PENDING',
      },
      include: {
        section: true,
        session: {
          include: {
            teacher: true,
          },
        },
      },
    });
  }
}
