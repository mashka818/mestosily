import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as XLSX from 'xlsx';

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
    startOfMonth.setHours(0, 0, 0, 0);
    // Первый день следующего месяца
    const endOfMonth = new Date(targetYear, targetMonth, 1);
    endOfMonth.setHours(23, 59, 59, 999);

    const sessions = await this.prisma.lesson.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      include: {
        section: true,
        teacher: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: [{ date: 'asc' }, { startsAt: 'asc' }],
    });

    const events = await this.prisma.event.findMany({
      where: {
        isActive: true,
        publishedAt: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      select: {
        id: true,
        name: true,
        title: true,
        description: true,
        date: true,
        imageUrl: true,
        bannerUrl: true,
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

  async findByDate(date: Date) {
    // Начало дня
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // Конец дня
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Получаем уроки для этой конкретной даты
    const lessons = await this.prisma.lesson.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        section: true,
        teacher: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { startsAt: 'asc' },
    });

    // Получаем события на эту дату
    const events = await this.prisma.event.findMany({
      where: {
        isActive: true,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        _count: { select: { eventRegistrations: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    return {
      date: date.toISOString().split('T')[0],
      lessons,
      events,
    };
  }

  async findOne(id: string) {
    return this.prisma.lesson.findUnique({
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

          // Форматируем время в строки HH:MM
          const startsAt = startTime.toString();
          const endsAt = endTime.toString();

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

          // Парсим дату
          let lessonDate: Date;
          if (typeof date === 'number') {
            // Excel хранит даты как числа (количество дней с 1900-01-01)
            lessonDate = new Date((date - 25569) * 86400 * 1000);
          } else {
            lessonDate = new Date(date.toString());
          }

          if (isNaN(lessonDate.getTime())) {
            errors.push(`Строка ${rowNum}: Неверный формат даты: ${date}`);
            continue;
          }

          // Создаем занятие
          const session = await this.prisma.lesson.create({
            data: {
              sectionId,
              teacherId,
              date: lessonDate,
              startsAt,
              endsAt,
              location,
              capacity: parseInt(capacity.toString()),
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
