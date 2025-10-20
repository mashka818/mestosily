import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { AddMediaDto } from './dto/add-media.dto';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async create(createNewsDto: CreateNewsDto, userId: string) {
    return this.prisma.news.create({
      data: {
        ...createNewsDto,
        publishedAt: createNewsDto.publishedAt ? new Date(createNewsDto.publishedAt) : new Date(),
        createdBy: userId,
      },
      include: {
        medias: true,
        createdByUser: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.news.findMany({
      where: { isActive: true },
      include: {
        medias: true,
        createdByUser: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: { select: { eventRegistrations: true } },
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const news = await this.prisma.news.findUnique({
      where: { id },
      include: {
        medias: {
          orderBy: { sortOrder: 'asc' },
        },
        createdByUser: {
          select: { id: true, firstName: true, lastName: true },
        },
        eventRegistrations: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    if (!news) {
      throw new NotFoundException('Новость не найдена');
    }

    return news;
  }

  async update(id: string, updateNewsDto: UpdateNewsDto) {
    const news = await this.findOne(id);

    return this.prisma.news.update({
      where: { id },
      data: {
        ...updateNewsDto,
        publishedAt: updateNewsDto.publishedAt ? new Date(updateNewsDto.publishedAt) : undefined,
      },
      include: {
        medias: true,
        createdByUser: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async remove(id: string) {
    const news = await this.findOne(id);

    await this.prisma.news.delete({
      where: { id },
    });

    return { message: 'Новость удалена' };
  }

  async addMedia(newsId: string, addMediaDto: AddMediaDto) {
    const news = await this.findOne(newsId);

    return this.prisma.newsMedia.create({
      data: {
        newsId,
        ...addMediaDto,
      },
    });
  }

  async removeMedia(mediaId: string) {
    const media = await this.prisma.newsMedia.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      throw new NotFoundException('Медиафайл не найден');
    }

    await this.prisma.newsMedia.delete({
      where: { id: mediaId },
    });

    return { message: 'Медиафайл удален' };
  }

  async registerForEvent(newsId: string, userId: string) {
    const news = await this.findOne(newsId);

    if (news.type !== 'EVENT') {
      throw new Error('Можно записываться только на события');
    }

    const existing = await this.prisma.eventRegistration.findUnique({
      where: {
        userId_newsId: {
          userId,
          newsId,
        },
      },
    });

    if (existing) {
      throw new Error('Вы уже записаны на это событие');
    }

    return this.prisma.eventRegistration.create({
      data: {
        userId,
        newsId,
        status: 'PENDING',
      },
      include: {
        news: true,
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }
}
