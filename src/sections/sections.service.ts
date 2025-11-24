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
        lessons: {
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
        lessons: {
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
        images: {
          orderBy: { position: 'asc' },
        },
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

  async enroll(sectionId: string, userId: string, lessonId?: string) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        lessons: {
          where: lessonId ? { id: lessonId } : undefined,
        },
      },
    });

    if (!section) {
      throw new NotFoundException('Секция не найдена');
    }

    if (lessonId) {
      const lesson = section.lessons.find((s) => s.id === lessonId);
      if (!lesson) {
        throw new NotFoundException('Занятие не найдено');
      }

      const enrollmentsCount = await this.prisma.enrollment.count({
        where: { lessonId },
      });

      if (lesson.capacity && enrollmentsCount >= lesson.capacity) {
        throw new Error('Мест на занятие не осталось');
      }
    }

    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        sectionId,
        lessonId: lessonId || null,
      },
    });

    if (existingEnrollment) {
      throw new Error('Вы уже записаны на эту секцию');
    }

    return this.prisma.enrollment.create({
      data: {
        userId,
        sectionId,
        lessonId,
        status: 'PENDING',
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

  async addSectionImage(sectionId: string, imageUrl: string, position: number) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('Секция не найдена');
    }

    return this.prisma.sectionImage.create({
      data: {
        sectionId,
        imageUrl,
        position,
      },
    });
  }

  async getSectionImages(sectionId: string) {
    return this.prisma.sectionImage.findMany({
      where: { sectionId },
      orderBy: { position: 'asc' },
    });
  }

  async updateSectionImagePosition(imageId: string, position: number) {
    const image = await this.prisma.sectionImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Изображение не найдено');
    }

    return this.prisma.sectionImage.update({
      where: { id: imageId },
      data: { position },
    });
  }

  async deleteSectionImage(imageId: string) {
    const image = await this.prisma.sectionImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Изображение не найдено');
    }

    await this.prisma.sectionImage.delete({
      where: { id: imageId },
    });

    return { message: 'Изображение удалено' };
  }
}
