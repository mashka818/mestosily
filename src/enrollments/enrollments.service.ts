import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  // Получить все записи пользователя
  async getMyEnrollments(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        section: true,
        lesson: {
          include: {
            teacher: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Записаться на секцию/урок
  async enroll(userId: string, sectionId: string, lessonId?: string) {
    // Проверяем, не записан ли уже пользователь
    const existing = await this.prisma.enrollment.findUnique({
      where: {
        userId_sectionId_lessonId: {
          userId,
          sectionId,
          lessonId: lessonId || null,
        },
      },
    });

    if (existing) {
      throw new Error('Вы уже записаны на эту секцию/урок');
    }

    // Проверяем вместимость урока, если указан
    if (lessonId) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          _count: {
            select: { enrollments: true },
          },
        },
      });

      if (lesson?.capacity && lesson._count.enrollments >= lesson.capacity) {
        throw new Error('Нет свободных мест');
      }
    }

    return this.prisma.enrollment.create({
      data: {
        userId,
        sectionId,
        lessonId,
        status: EnrollmentStatus.APPROVED,
        paymentStatus: PaymentStatus.PAID,
        enrolledAt: new Date(),
      },
      include: {
        section: true,
        lesson: {
          include: {
            teacher: true,
          },
        },
      },
    });
  }

  // Отменить запись
  async cancelEnrollment(enrollmentId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new Error('Запись не найдена');
    }

    if (enrollment.userId !== userId) {
      throw new Error('Вы не можете отменить чужую запись');
    }

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: EnrollmentStatus.CANCELLED },
    });
  }
}
