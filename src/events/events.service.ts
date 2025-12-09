import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    return this.prisma.event.create({
      data: createEventDto,
    });
  }

  async findAll() {
    return this.prisma.event.findMany({
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findUpcoming() {
    const now = new Date();
    return this.prisma.event.findMany({
      where: {
        date: {
          gte: now,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Событие не найдено');
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    await this.findOne(id);

    return this.prisma.event.update({
      where: { id },
      data: updateEventDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.event.delete({
      where: { id },
    });
  }

  // Регистрация на мероприятие
  async registerForEvent(userId: string, eventId: string) {
    // Проверяем существование мероприятия
    const event = await this.findOne(eventId);

    // Проверяем, не зарегистрирован ли уже пользователь
    const existing = await this.prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existing) {
      throw new Error('Вы уже зарегистрированы на это мероприятие');
    }

    // Проверяем лимит участников
    if (event.maxParticipants) {
      const registrationsCount = await this.prisma.eventRegistration.count({
        where: {
          eventId,
          status: 'APPROVED',
        },
      });

      if (registrationsCount >= event.maxParticipants) {
        throw new Error('Достигнут лимит участников');
      }
    }

    return this.prisma.eventRegistration.create({
      data: {
        userId,
        eventId,
        status: 'APPROVED',
        registeredAt: new Date(),
      },
      include: {
        event: true,
      },
    });
  }

  // Отменить регистрацию на мероприятие
  async cancelRegistration(userId: string, eventId: string) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (!registration) {
      throw new NotFoundException('Регистрация не найдена');
    }

    return this.prisma.eventRegistration.update({
      where: {
        id: registration.id,
      },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  // Получить регистрации пользователя
  async getMyRegistrations(userId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { userId },
      include: {
        event: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
