import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async create(createNewsDto: CreateNewsDto) {
    return this.prisma.news.create({
      data: createNewsDto,
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      this.prisma.news.findMany({
        skip,
        take: limit,
        orderBy: {
          publishedAt: 'desc',
        },
      }),
      this.prisma.news.count(),
    ]);

    return {
      data: news,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findRecent(limit: number = 5) {
    return this.prisma.news.findMany({
      take: limit,
      orderBy: {
        publishedAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const news = await this.prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      throw new NotFoundException('Новость не найдена');
    }

    return news;
  }

  async update(id: string, updateNewsDto: UpdateNewsDto) {
    await this.findOne(id);

    return this.prisma.news.update({
      where: { id },
      data: updateNewsDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.news.delete({
      where: { id },
    });
  }
}
