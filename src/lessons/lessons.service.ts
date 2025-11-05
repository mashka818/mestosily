import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async create(createLessonDto: CreateLessonDto) {
    const section = await this.prisma.section.findUnique({
      where: { id: createLessonDto.sectionId },
    });

    if (!section) {
      throw new NotFoundException('Секция не найдена');
    }

    if (createLessonDto.teacherId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: createLessonDto.teacherId },
      });

      if (!teacher) {
        throw new NotFoundException('Учитель не найден');
      }
    }

    return this.prisma.lesson.create({
      data: createLessonDto,
      include: {
        section: true,
        teacher: true,
      },
    });
  }

  async findAll(sectionId?: string) {
    const where = sectionId ? { sectionId } : {};
    return this.prisma.lesson.findMany({
      where,
      include: {
        section: true,
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
      orderBy: [{ dayOfWeek: 'asc' }, { startsAt: 'asc' }],
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        section: true,
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
    });

    if (!lesson) {
      throw new NotFoundException('Урок не найден');
    }

    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto) {
    await this.findOne(id);

    if (updateLessonDto.teacherId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: updateLessonDto.teacherId },
      });

      if (!teacher) {
        throw new NotFoundException('Учитель не найден');
      }
    }

    return this.prisma.lesson.update({
      where: { id },
      data: updateLessonDto,
      include: {
        section: true,
        teacher: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.lesson.delete({
      where: { id },
    });
  }

  async importFromExcel(file: Express.Multer.File, sectionId: string) {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(worksheet);

      const section = await this.prisma.section.findUnique({
        where: { id: sectionId },
      });

      if (!section) {
        throw new NotFoundException('Секция не найдена');
      }

      const lessons = [];
      const errors = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];

        try {
          if (!row['День недели'] || !row['Время начала'] || !row['Время окончания']) {
            errors.push({
              row: i + 2,
              error: 'Отсутствуют обязательные поля: День недели, Время начала или Время окончания',
            });
            continue;
          }

          const dayOfWeekMap: { [key: string]: number } = {
            Понедельник: 1,
            Вторник: 2,
            Среда: 3,
            Четверг: 4,
            Пятница: 5,
            Суббота: 6,
            Воскресенье: 7,
          };

          const dayOfWeek = dayOfWeekMap[row['День недели']];
          if (!dayOfWeek) {
            errors.push({
              row: i + 2,
              error: `Неверный день недели: ${row['День недели']}`,
            });
            continue;
          }

          let teacherId = null;
          if (row['Учитель']) {
            const teacherName = row['Учитель'].trim();
            const [lastName, firstName] = teacherName.split(' ');

            const teacher = await this.prisma.teacher.findFirst({
              where: {
                firstName: firstName?.trim(),
                lastName: lastName?.trim(),
              },
            });

            if (teacher) {
              teacherId = teacher.id;
            } else {
              errors.push({
                row: i + 2,
                warning: `Учитель "${teacherName}" не найден, урок создан без учителя`,
              });
            }
          }

          const lesson = await this.prisma.lesson.create({
            data: {
              sectionId,
              teacherId,
              dayOfWeek,
              startsAt: row['Время начала'].toString(),
              endsAt: row['Время окончания'].toString(),
              location: row['Место']?.toString() || null,
              capacity: row['Вместимость'] ? parseInt(row['Вместимость']) : null,
            },
            include: {
              teacher: true,
            },
          });

          lessons.push(lesson);
        } catch (error) {
          errors.push({
            row: i + 2,
            error: error.message,
          });
        }
      }

      return {
        success: lessons.length,
        total: data.length,
        lessons,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      throw new BadRequestException('Ошибка при обработке файла: ' + error.message);
    }
  }

  async getScheduleForSection(sectionId: string) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('Секция не найдена');
    }

    const lessons = await this.prisma.lesson.findMany({
      where: { sectionId },
      include: {
        teacher: true,
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startsAt: 'asc' }],
    });

    const schedule = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
    };

    lessons.forEach((lesson) => {
      schedule[lesson.dayOfWeek].push(lesson);
    });

    return {
      section,
      schedule,
    };
  }

  async getExcelTemplate() {
    const template = [
      {
        'День недели': 'Понедельник',
        'Время начала': '15:00',
        'Время окончания': '16:00',
        Место: 'Кабинет 101',
        Учитель: 'Иванов Иван',
        Вместимость: 15,
      },
      {
        'День недели': 'Среда',
        'Время начала': '19:00',
        'Время окончания': '20:00',
        Место: 'Кабинет 102',
        Учитель: 'Петров Петр',
        Вместимость: 20,
      },
      {
        'День недели': 'Пятница',
        'Время начала': '10:00',
        'Время окончания': '11:30',
        Место: 'Спортзал',
        Учитель: 'Сидоров Сидор',
        Вместимость: 25,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Расписание');

    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
