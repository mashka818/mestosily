import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NewsType } from '@prisma/client';
import * as XLSX from 'xlsx';
import { ScheduleRow } from './dto/import-schedule.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(year?: number, month?: number) {
    // Если год и месяц не указаны - показываем текущий месяц
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1; // +1 потому что getMonth() возвращает 0-11

    // Первый день месяца
    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    // Первый день следующего месяца
    const endOfMonth = new Date(targetYear, targetMonth, 1);

    const sessions = await this.prisma.session.findMany({
      where: {
        startsAt: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
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
        publishedAt: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        imageUrl: true,
        publishedAt: true,
        createdAt: true,
        _count: { select: { eventRegistrations: true } },
      },
      orderBy: { publishedAt: 'asc' },
    });

    return {
      year: targetYear,
      month: targetMonth,
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

  async generateTemplate() {
    // Получаем данные для справки
    const sections = await this.prisma.section.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    const teachers = await this.prisma.teacher.findMany({
      select: { id: true, firstName: true, lastName: true },
    });

    // Создаем пример данных для шаблона
    const exampleData = [
      {
        Дата: '2025-01-15',
        'Время начала': '10:00',
        'Время окончания': '11:30',
        'ID секции': sections[0]?.id || 'clxxx123',
        'Название секции (справочно)': sections[0]?.name || 'Шахматы',
        'ID преподавателя': teachers[0]?.id || 'clyyy456',
        'Преподаватель (справочно)': teachers[0]
          ? `${teachers[0].firstName} ${teachers[0].lastName}`
          : 'Иван Петров',
        Местоположение: 'Зал 1',
        Вместимость: 15,
      },
    ];

    // Создаем лист "Расписание"
    const ws = XLSX.utils.json_to_sheet(exampleData);

    // Создаем листы со справочной информацией
    const sectionsData = sections.map((s) => ({
      ID: s.id,
      Название: s.name,
    }));

    const teachersData = teachers.map((t) => ({
      ID: t.id,
      ФИО: `${t.firstName} ${t.lastName}`,
    }));

    const wsSections = XLSX.utils.json_to_sheet(sectionsData);
    const wsTeachers = XLSX.utils.json_to_sheet(teachersData);

    // Создаем рабочую книгу
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Расписание');
    XLSX.utils.book_append_sheet(wb, wsSections, 'Секции');
    XLSX.utils.book_append_sheet(wb, wsTeachers, 'Преподаватели');

    // Генерируем буфер
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  async importSchedule(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    try {
      // Читаем файл
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Преобразуем в JSON
      const data: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (!data || data.length === 0) {
        throw new BadRequestException('Файл пустой или неверный формат');
      }

      const created = [];
      const errors = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNum = i + 2; // +2 потому что 1 строка - заголовок

        try {
          // Парсим дату и время
          const date = row['Дата'];
          const startTime = row['Время начала'];
          const endTime = row['Время окончания'];
          const sectionId = row['ID секции'];
          const teacherId = row['ID преподавателя'];
          const location = row['Местоположение'];
          const capacity = parseInt(row['Вместимость'], 10);

          if (
            !date ||
            !startTime ||
            !endTime ||
            !sectionId ||
            !teacherId ||
            !location ||
            !capacity
          ) {
            errors.push(`Строка ${rowNum}: Заполнены не все обязательные поля`);
            continue;
          }

          // Создаем DateTime
          const [year, month, day] = date.toString().split('-');
          const [startHour, startMin] = startTime.toString().split(':');
          const [endHour, endMin] = endTime.toString().split(':');

          const startsAt = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(startHour),
            parseInt(startMin),
          );

          const endsAt = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(endHour),
            parseInt(endMin),
          );

          // Проверяем существование секции и преподавателя
          const section = await this.prisma.section.findUnique({
            where: { id: sectionId },
          });

          if (!section) {
            errors.push(`Строка ${rowNum}: Секция с ID ${sectionId} не найдена`);
            continue;
          }

          const teacher = await this.prisma.teacher.findUnique({
            where: { id: teacherId },
          });

          if (!teacher) {
            errors.push(`Строка ${rowNum}: Преподаватель с ID ${teacherId} не найден`);
            continue;
          }

          // Создаем занятие
          const session = await this.prisma.session.create({
            data: {
              sectionId,
              teacherId,
              startsAt,
              endsAt,
              location,
              capacity,
            },
            include: {
              section: true,
              teacher: true,
            },
          });

          created.push(session);
        } catch (error) {
          errors.push(`Строка ${rowNum}: ${error.message}`);
        }
      }

      return {
        success: true,
        created: created.length,
        errors: errors.length,
        details: {
          createdSessions: created,
          errorMessages: errors,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Ошибка обработки файла: ${error.message}`);
    }
  }
}
